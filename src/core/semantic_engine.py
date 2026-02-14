import re
import numpy as np
from sentence_transformers import SentenceTransformer, util
# Note: util.pytorch_cos_sim is often used, or sklearn's cosine_similarity
# The user snippet used sklearn.metrics.pairwise.cosine_similarity.
# sentence_transformers has util.cos_sim which is faster/better integrated usually.
# But I will stick to the user's snippet logic as much as possible for consistency with their request 
# (although I'll use util.cos_sim if I don't want to depend on sklearn just for that, but user asked for sklearn in requirements).
from sklearn.metrics.pairwise import cosine_similarity

# Configuration
# Choosing a lightweight but good model for multilingual text (CVs can be FR/EN)
MODEL_NAME = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'

class MatchingEngine:
    _instance = None
    _model = None

    def __new__(cls, *args, **kwargs):
        """Singleton pattern to avoid reloading model on each instantiation"""
        if cls._instance is None:
            cls._instance = super(MatchingEngine, cls).__new__(cls)
        return cls._instance

    def __init__(self, model_path=None):
        # Avoid reloading if already loaded (singleton check)
        if MatchingEngine._model is None:
            print("Chargement du modèle de matching (IA Sémantique)...")
            try:
                if model_path:
                    MatchingEngine._model = SentenceTransformer(model_path)
                else:
                    MatchingEngine._model = SentenceTransformer(MODEL_NAME)
                print("Modèle IA chargé avec succès.")
            except Exception as e:
                print(f"Erreur chargement modèle: {e}")
                # Fallback implementation or re-raise?
                # For now let's re-raise as the app depends on it.
                raise e

    def _clean_text(self, text: str) -> str:
        if not text: return ""
        # Nettoyage basique
        text = str(text) # Ensure string
        text = text.replace('\n', ' ').replace('\r', ' ')
        text = re.sub(r'\S+@\S+', '', text) # Remove emails
        text = re.sub(r'http\S+', '', text) # Remove URLs
        # Keep accents for French
        text = re.sub(r'[^a-zA-Z0-9àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ\s\.,;:\-\(\)]', ' ', text)
        text = re.sub(r'\s+', ' ', text).lower().strip()
        return text

    def compute_score(self, cv_text: str, job_text: str) -> float:
        """
        Calcule le score de similarité cosinus entre deux textes.
        Retourne un float entre 0.0 et 1.0.
        """
        cv_clean = self._clean_text(cv_text)
        job_clean = self._clean_text(job_text)
        
        if not cv_clean or not job_clean:
            return 0.0
       
        # Encodage
        embeddings = MatchingEngine._model.encode([cv_clean, job_clean])
        
        # Calcul Cosine Similarity
        # embeddings[0] is cv, embeddings[1] is job
        score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        
        # Clip to 0-1 range (cosine sim can be negative for opposite vectors via -1 to 1)
        return float(max(0.0, min(1.0, score)))
