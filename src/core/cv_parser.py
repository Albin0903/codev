"""
Utilitaire pour parser les CV et extraire les informations pertinentes.
Supporte PDF et DOCX avec Google Gemini API.
"""
import os
import json
from typing import Dict, Optional
import google.generativeai as genai
import pdfplumber
from docx import Document


def extract_text_from_pdf(file_obj) -> str:
    """Extrait le texte d'un fichier PDF"""
    try:
        text = ""
        with pdfplumber.open(file_obj) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    except Exception as e:
        print(f"Erreur extraction PDF: {e}")
        return ""


def extract_text_from_docx(file_obj) -> str:
    """Extrait le texte d'un fichier DOCX"""
    try:
        doc = Document(file_obj)
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        print(f"Erreur extraction DOCX: {e}")
        return ""


def initialize_gemini():
    """Initialise le client Gemini avec la clé API"""
    api_key = os.getenv('GOOGLE_AI_API_KEY')
    if not api_key:
        raise ValueError("GOOGLE_AI_API_KEY non définie dans les variables d'environnement")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.5-flash')


def parse_cv(file_obj, content_type: str) -> Dict:
    """
    Parse un CV avec Gemini et retourne les informations extraites.
    
    Args:
        file_obj: Fichier uploadé (InMemoryUploadedFile ou similaire)
        content_type: Type MIME du fichier
    
    Returns:
        Dict avec les champs extraits:
        - first_name: Prénom
        - last_name: Nom de famille
        - email: Adresse email
        - phone: Numéro de téléphone
        - linkedin_url: URL LinkedIn
        - github_url: URL GitHub
        - website_url: URL du site personnel
        - location: Ville/région
        - about: Résumé/Bio
        - availability: Disponibilité
        - duration: Durée
        - languages: Liste structurée des langues
        - skills: List de compétences techniques
        - hobbies: Liste des loisirs
        - education: Liste structurée des formations
        - experience: Liste structurée des expériences
    """
    # Lire le contenu du fichier
    file_obj.seek(0)
    
    # Extraire le texte selon le type
    if 'pdf' in content_type:
        text = extract_text_from_pdf(file_obj)
    elif 'word' in content_type or 'docx' in content_type:
        text = extract_text_from_docx(file_obj)
    else:
        return {}
    
    if not text or len(text.strip()) < 50:
        return {}
    
    try:
        # Initialiser Gemini
        model = initialize_gemini()
        
        # Prompt pour extraire les infos du CV
        prompt = f"""Extrait les informations suivantes d'un CV et retourne le résultat au format JSON.
Retourne UNIQUEMENT du JSON valide, sans autre texte.

Informations à extraire (retourne null si non trouvé):
- email: Adresse email (string)
- phone: Numéro de téléphone au format E.164 ou français (string)
- linkedin_url: URL LinkedIn complète (string)
- github_url: URL GitHub complète (string)
- website_url: URL du site personnel, hors LinkedIn/GitHub (string)
- location: Ville ou région où la personne RECHERCHE un stage/emploi (pas l'adresse de l'école). Si non précisé explicitement, mettre null. (string)
- about: Phrase d'accroche ou résumé du profil, rédigée à la 3ème personne (string)
- availability: Date de disponibilité pour un stage, avec majuscule au début (ex: "Février 2026") (string)
- duration: Durée de stage souhaitée, avec majuscule au début (ex: "6 Mois", "22 Semaines") (string)
- program: Formation ou filière actuelle (ex: "Informatique", "Génie Civil", "Data Science"). C'est la spécialité/filière de l'école, pas le diplôme complet. (string)
- year: Année d'études ACTUELLE, format court (ex: "M2", "M1", "L3", "5A"). Préférer M1/M2/L3. (string)
- role: Statut ACTUEL de la personne (ce qu'elle est maintenant, pas ce qu'elle cherche). Options: "Étudiant" (en formation classique cherchant un stage), "Alternant" (en contrat d'alternance), "Apprenti" (en contrat d'apprentissage). Un étudiant qui cherche un stage reste un "Étudiant". (string)
- languages: Array d'objets {{"language": string, "level": string}} - met une majuscule au début de la langue et du niveau (ex: "Anglais", "Courant")
- skills: Array de compétences techniques ET soft skills (max 20). Inclure les langages de programmation, frameworks, outils, méthodologies, ET les compétences transversales comme "Travail en équipe", "Communication", "Gestion de projet", etc. (array de strings)
- hobbies: Array de loisirs et centres d'intérêt (array de strings)
- education: Array d'objets {{"school": string, "degree": string, "year": string, "description": string}} - avec majuscules appropriées
- experience: Array d'objets {{"company": string, "position": string, "duration": string, "description": string}} - avec majuscules appropriées

IMPORTANT: 
- Mets une majuscule au début des valeurs textuelles (noms propres, villes, etc.)
- Pour les skills, inclus TOUTES les compétences mentionnées: techniques (Python, React, SQL...) ET soft skills (Leadership, Communication, Adaptabilité...)
- Pour "year", utilise un format court et standard (M2, M1, L3, etc.)
- Pour "role", c'est le STATUT ACTUEL: un étudiant en école d'ingénieur qui cherche un stage = "Étudiant"
- Pour "program", extrais juste la filière/spécialité (ex: "Informatique"), pas le diplôme complet

CV à traiter:
{text}

Réponse JSON:"""        
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Nettoyer si le modèle a mis du texte avant/après le JSON
        if '{' in response_text:
            start_idx = response_text.index('{')
            response_text = response_text[start_idx:]
        
        if response_text.endswith('```'):
            response_text = response_text[:-3].rstrip()
        
        # Parser la réponse JSON
        result = json.loads(response_text)
        
        # Nettoyer les valeurs vides et null
        cleaned_result = {}
        for key, value in result.items():
            if value is not None and value != '' and value != []:
                cleaned_result[key] = value
        
        return cleaned_result
    
    except json.JSONDecodeError as e:
        print(f"Erreur parsing JSON de Gemini: {e}")
        return {}
    except Exception as e:
        print(f"Erreur lors du parsing CV avec Gemini: {e}")
        return {}
