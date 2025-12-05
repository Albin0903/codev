"""
Utilitaire pour parser les CV et extraire les informations pertinentes.
Supporte PDF et DOCX.
"""
import re
import io
from typing import Dict, Optional, List

def extract_text_from_pdf(file_obj) -> str:
    """Extrait le texte d'un fichier PDF"""
    try:
        import pdfplumber
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
        from docx import Document
        doc = Document(file_obj)
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        print(f"Erreur extraction DOCX: {e}")
        return ""

def extract_email(text: str) -> Optional[str]:
    """Extrait l'email du texte"""
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(pattern, text)
    return match.group(0) if match else None

def extract_phone(text: str) -> Optional[str]:
    """Extrait le numéro de téléphone du texte"""
    # Formats français et internationaux
    patterns = [
        r'(?:\+33|0033|0)\s*[1-9](?:[\s.-]*\d{2}){4}',  # Format français
        r'\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}',  # Format international
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            phone = re.sub(r'[\s.-]', '', match.group(0))
            return phone
    return None

def extract_linkedin(text: str) -> Optional[str]:
    """Extrait l'URL LinkedIn du texte"""
    patterns = [
        r'(?:https?://)?(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+/?',
        r'linkedin\.com/in/[a-zA-Z0-9_-]+',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            url = match.group(0)
            if not url.startswith('http'):
                url = 'https://' + url
            return url
    return None

def extract_github(text: str) -> Optional[str]:
    """Extrait l'URL GitHub du texte"""
    patterns = [
        r'(?:https?://)?(?:www\.)?github\.com/[a-zA-Z0-9_-]+/?',
        r'github\.com/[a-zA-Z0-9_-]+',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            url = match.group(0)
            if not url.startswith('http'):
                url = 'https://' + url
            return url
    return None

def extract_website(text: str) -> Optional[str]:
    """Extrait une URL de site personnel (hors LinkedIn/GitHub)"""
    pattern = r'(?:https?://)?(?:www\.)?[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(?:/[^\s]*)?'
    matches = re.findall(pattern, text, re.IGNORECASE)
    for url in matches:
        lower = url.lower()
        if 'linkedin' not in lower and 'github' not in lower and 'google' not in lower:
            if not url.startswith('http'):
                url = 'https://' + url
            return url
    return None

def extract_name(text: str) -> Dict[str, str]:
    """Tente d'extraire le nom et prénom (première ligne souvent)"""
    lines = text.strip().split('\n')
    if lines:
        first_line = lines[0].strip()
        # Nettoyer et diviser
        words = first_line.split()
        if len(words) >= 2:
            # Supposer que le premier mot est le prénom, le dernier le nom
            return {
                'first_name': words[0].capitalize(),
                'last_name': ' '.join(words[1:]).upper()
            }
        elif len(words) == 1:
            return {'first_name': words[0].capitalize(), 'last_name': ''}
    return {}

def extract_skills(text: str) -> List[str]:
    """Extrait les compétences techniques du texte"""
    # Liste de compétences techniques courantes
    tech_skills = [
        'Python', 'JavaScript', 'TypeScript', 'Java', 'C\\+\\+', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
        'React', 'Vue', 'Angular', 'Node\\.js', 'Django', 'Flask', 'Spring', 'Laravel', 'Express',
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD', 'Jenkins',
        'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'SASS', 'LESS',
        'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP',
        'Agile', 'Scrum', 'DevOps', 'REST API', 'GraphQL',
    ]
    
    found_skills = []
    text_lower = text.lower()
    
    for skill in tech_skills:
        if re.search(rf'\b{skill}\b', text, re.IGNORECASE):
            # Normaliser le nom
            clean_skill = skill.replace('\\', '').replace('.', '')
            if clean_skill not in found_skills:
                found_skills.append(clean_skill)
    
    return found_skills[:15]  # Limiter à 15 compétences

def extract_education(text: str) -> str:
    """Extrait la section éducation/formation du CV"""
    # Chercher les sections éducation
    patterns = [
        r'(?:FORMATION|ÉDUCATION|EDUCATION|ÉTUDES|DIPLÔMES?)[:\s]*\n((?:.*\n)*?)(?=\n[A-Z]{3,}|\Z)',
        r'(?:Formation|Éducation|Education|Études|Diplômes?)[:\s]*\n((?:.*\n)*?)(?=\n[A-Z][a-z]+\s*:|\Z)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            education = match.group(1).strip()
            # Nettoyer et limiter
            lines = [l.strip() for l in education.split('\n') if l.strip()]
            return '\n'.join(lines[:5])  # Max 5 lignes
    
    return ""

def extract_experience(text: str) -> str:
    """Extrait la section expérience professionnelle du CV"""
    patterns = [
        r'(?:EXPÉRIENCES?\s*PROFESSIONNELLES?|EXPERIENCES?\s*PROFESSIONNELLES?|EXPÉRIENCES?)[:\s]*\n((?:.*\n)*?)(?=\n[A-Z]{3,}|\Z)',
        r'(?:Expériences?\s*professionnelles?|Experiences?\s*professionnelles?|Expériences?)[:\s]*\n((?:.*\n)*?)(?=\n[A-Z][a-z]+\s*:|\Z)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            experience = match.group(1).strip()
            lines = [l.strip() for l in experience.split('\n') if l.strip()]
            return '\n'.join(lines[:8])  # Max 8 lignes
    
    return ""

def extract_location(text: str) -> Optional[str]:
    """Extrait la localisation du CV"""
    # Chercher des villes françaises courantes
    cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 
              'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Grenoble']
    
    for city in cities:
        if re.search(rf'\b{city}\b', text, re.IGNORECASE):
            return city
    
    # Chercher un code postal
    match = re.search(r'\b(\d{5})\b', text)
    if match:
        return match.group(1)
    
    return None

def extract_languages(text: str) -> str:
    """Extrait les langues parlées"""
    languages = []
    lang_patterns = {
        'Français': r'\b(?:français|french)\b',
        'Anglais': r'\b(?:anglais|english)\b',
        'Espagnol': r'\b(?:espagnol|spanish)\b',
        'Allemand': r'\b(?:allemand|german)\b',
        'Italien': r'\b(?:italien|italian)\b',
        'Chinois': r'\b(?:chinois|chinese|mandarin)\b',
        'Arabe': r'\b(?:arabe|arabic)\b',
        'Portugais': r'\b(?:portugais|portuguese)\b',
    }
    
    for lang, pattern in lang_patterns.items():
        if re.search(pattern, text, re.IGNORECASE):
            languages.append(lang)
    
    return ', '.join(languages) if languages else ''


def parse_cv(file_obj, content_type: str) -> Dict:
    """
    Parse un CV et retourne les informations extraites.
    
    Args:
        file_obj: Fichier uploadé (InMemoryUploadedFile ou similaire)
        content_type: Type MIME du fichier
    
    Returns:
        Dict avec les champs extraits
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
    
    if not text:
        return {}
    
    # Extraire toutes les informations
    result = {}
    
    # Liens sociaux
    linkedin = extract_linkedin(text)
    if linkedin:
        result['linkedin_url'] = linkedin
    
    github = extract_github(text)
    if github:
        result['github_url'] = github
    
    website = extract_website(text)
    if website:
        result['website_url'] = website
    
    # Contact
    phone = extract_phone(text)
    if phone:
        result['phone'] = phone
    
    email = extract_email(text)
    if email:
        result['email'] = email
    
    # Nom (optionnel, l'utilisateur a peut-être déjà renseigné)
    name = extract_name(text)
    if name:
        result['extracted_name'] = name
    
    # Localisation
    location = extract_location(text)
    if location:
        result['location'] = location
    
    # Langues
    languages = extract_languages(text)
    if languages:
        result['languages'] = languages
    
    # Compétences
    skills = extract_skills(text)
    if skills:
        result['skills'] = skills
    
    # Éducation
    education = extract_education(text)
    if education:
        result['education'] = education
    
    # Expérience
    experience = extract_experience(text)
    if experience:
        result['experience'] = experience
    
    return result
