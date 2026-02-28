import re
import numpy as np
from sentence_transformers import SentenceTransformer, util
from sklearn.metrics.pairwise import cosine_similarity

MODEL_NAME = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'

class MatchingEngine:
    _instance = None
    _model = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(MatchingEngine, cls).__new__(cls)
        return cls._instance

    def __init__(self, model_path=None):
        if MatchingEngine._model is None:
            try:
                if model_path:
                    MatchingEngine._model = SentenceTransformer(model_path)
                else:
                    MatchingEngine._model = SentenceTransformer(MODEL_NAME)
            except Exception as e:
                print(f"Erreur chargement modèle: {e}")
                raise e

    def _clean_text(self, text: str) -> str:
        if not text: return ""
        text = str(text) 
        text = text.replace('\n', ' ').replace('\r', ' ')
        text = re.sub(r'\S+@\S+', '', text) 
        text = re.sub(r'http\S+', '', text) 
        text = re.sub(r'[^a-zA-Z0-9àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ\s\.,;:\-\(\)]', ' ', text)
        text = re.sub(r'\s+', ' ', text).lower().strip()
        return text

    def compute_score(self, cv_text: str, job_text: str) -> float:
        cv_clean = self._clean_text(cv_text)
        job_clean = self._clean_text(job_text)
        
        if not cv_clean or not job_clean:
            return 0.0
       
        embeddings = MatchingEngine._model.encode([cv_clean, job_clean])
        
        score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        
        return float(max(0.0, min(1.0, score)))
