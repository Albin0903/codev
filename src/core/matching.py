import re
from typing import List, Set
from .semantic_engine import MatchingEngine


def calculate_skills_match_score(student_skills: List[str], offer_text: str) -> float:
    if not student_skills or not offer_text:
        return 0.0
    
    offer_lower = offer_text.lower()
    
    matched = 0
    for skill in student_skills:
        skill_lower = skill.lower().strip()
        if not skill_lower:
            continue
        
        if skill_lower in offer_lower:
            matched += 1
            continue
        
        variants = [skill_lower]
        clean = re.sub(r'\.(js|ts|net|py)$', '', skill_lower, flags=re.IGNORECASE)
        if clean != skill_lower:
            variants.append(clean)
        if '/' in skill_lower:
            variants.extend(skill_lower.split('/'))
        
        if any(v in offer_lower for v in variants):
            matched += 1
            continue
        
        if len(skill_lower) >= 4:
            offer_words = re.findall(r'[a-zà-ÿ0-9+#.]+', offer_lower)
            if any(skill_lower in w or w in skill_lower for w in offer_words if len(w) >= 4):
                matched += 0.5
    
    denominator = min(len(student_skills), 8)
    return min(1.0, matched / denominator)


def calculate_experience_match_score(student, offer) -> float:
    if not student.experience:
        return 0.0
    
    offer_keywords = set(re.findall(
        r'[a-zà-ÿ]{4,}',
        f"{offer.title} {offer.description}".lower()
    ))
    
    if not offer_keywords:
        return 0.0
    
    max_overlap = 0
    for exp in student.experience:
        if not isinstance(exp, dict):
            continue
        exp_text = f"{exp.get('position', '')} {exp.get('description', '')}".lower()
        exp_keywords = set(re.findall(r'[a-zà-ÿ]{4,}', exp_text))
        
        if exp_keywords:
            overlap = len(offer_keywords & exp_keywords) / len(offer_keywords)
            max_overlap = max(max_overlap, overlap)
    
    return min(1.0, max_overlap)


def calculate_location_score(student_location: str, offer_location: str) -> float:
    """
    Simple boolean match for location.
    """
    if not student_location or not offer_location:
        return 0.5  # Neutral if unknown

    student_loc = str(student_location).lower().strip()
    offer_loc = str(offer_location).lower().strip()

    # Extraire les villes principales
    student_cities = set(re.findall(r'[a-zà-ÿ]+', student_loc))
    offer_cities = set(re.findall(r'[a-zà-ÿ]+', offer_loc))
    
    if student_cities & offer_cities:
        return 1.0
    if student_loc in offer_loc or offer_loc in student_loc:
        return 1.0
    return 0.0


def calculate_match_score(student, offer) -> int:
    """
    Calculate a global matching score between a student and an offer.
    Uses a multi-criteria approach:
      - Semantic AI similarity (40%)
      - Skills direct match (25%)
      - Experience relevance (10%)
      - Location match (15%)
      - Education level (10%)
    
    Returns an integer between 0 and 100.
    """

    # --- 1. Semantic Match (40%) ---
    student_text = f"{student.program} {student.about}"

    student_skills_names = [s.name for s in student.skills.all()]
    if student_skills_names:
        student_text += " Compétences: " + ", ".join(student_skills_names)

    if student.experience:
        for exp in student.experience:
            if isinstance(exp, dict):
                student_text += f" {exp.get('description', '')} {exp.get('position', '')}"

    offer_full_text = f"{offer.title} {offer.description} {offer.requirements}"

    try:
        engine = MatchingEngine()
        semantic_score = engine.compute_score(student_text, offer_full_text)
    except Exception as e:
        print(f"Error computing semantic score: {e}")
        semantic_score = 0.0

    # --- 2. Skills Direct Match (25%) ---
    skills_score = calculate_skills_match_score(student_skills_names, offer_full_text)

    # --- 3. Experience Relevance (10%) ---
    experience_score = calculate_experience_match_score(student, offer)

    # --- 4. Location Match (15%) ---
    location_score = calculate_location_score(student.location, offer.location)

    # --- 5. Education Level Match (10%) ---
    level_score = 0.5
    student_year = student.year.lower() if student.year else ""
    offer_reqs = offer.requirements.lower() if offer.requirements else ""

    if any(y in student_year for y in ['m2', '5a', "fin d'étude"]):
        if any(r in offer_reqs for r in ['bac+5', 'ingénieur', "fin d'étude"]):
            level_score = 1.0
    elif any(y in student_year for y in ['m1', '4a']):
        if 'bac+4' in offer_reqs:
            level_score = 1.0
        elif 'bac+5' in offer_reqs:
            level_score = 0.7

    # --- Weighted Sum ---
    total_score = (
        semantic_score * 40 +
        skills_score * 25 +
        experience_score * 10 +
        location_score * 15 +
        level_score * 10
    )

    return int(min(100, max(0, total_score)))


def compute_all_scores():
    """
    Pré-calcule les scores pour TOUS les couples étudiant × offre.
    Met à jour la progression via Django cache pour affichage temps réel.
    """
    from .models import Student, InternshipOffer, MatchScore
    from django.core.cache import cache
    
    students = list(Student.objects.prefetch_related('skills').all())
    offers = list(InternshipOffer.objects.all())
    
    total_pairs = len(students) * len(offers)
    if total_pairs == 0:
        cache.set('compute_scores_progress', {'done': 0, 'total': 0, 'status': 'done'}, timeout=3600)
        return 0
    
    cache.set('compute_scores_progress', {
        'done': 0, 'total': total_pairs, 'status': 'running',
        'current_student': '', 'current_offer': ''
    }, timeout=3600)
    
    done = 0
    for student in students:
        for offer in offers:
            score = calculate_match_score(student, offer)
            MatchScore.objects.update_or_create(
                student=student,
                offer=offer,
                defaults={'score': score}
            )
            done += 1
            # Update progress every score
            cache.set('compute_scores_progress', {
                'done': done,
                'total': total_pairs,
                'status': 'running',
                'current_student': str(student),
                'current_offer': offer.title,
            }, timeout=3600)
    
    cache.set('compute_scores_progress', {
        'done': total_pairs, 'total': total_pairs, 'status': 'done'
    }, timeout=3600)
    
    return total_pairs


def recompute_student_scores(student):
    """Recalcule les scores pour un étudiant spécifique (quand son profil change)."""
    from .models import InternshipOffer, MatchScore
    
    offers = InternshipOffer.objects.all()
    count = 0
    for offer in offers:
        score = calculate_match_score(student, offer)
        MatchScore.objects.update_or_create(
            student=student,
            offer=offer,
            defaults={'score': score}
        )
        count += 1
    return count


def recompute_offer_scores(offer):
    """Recalcule les scores pour une offre spécifique (quand l'offre change)."""
    from .models import Student, MatchScore
    
    students = Student.objects.prefetch_related('skills').all()
    count = 0
    for student in students:
        score = calculate_match_score(student, offer)
        MatchScore.objects.update_or_create(
            student=student,
            offer=offer,
            defaults={'score': score}
        )
        count += 1
    return count


def get_best_company_score(student, company):
    """
    Retourne le meilleur score caché d'un étudiant pour une entreprise.
    Fallback : calcul en temps réel si pas de score en cache.
    """
    from .models import MatchScore
    
    best = MatchScore.objects.filter(
        student=student,
        offer__company=company
    ).order_by('-score').first()
    
    if best:
        return best.score
    
    # Fallback: calcul en temps réel
    offers = company.offers.all()
    if not offers.exists():
        return 0
    
    max_score = 0
    for offer in offers:
        score = calculate_match_score(student, offer)
        if score > max_score:
            max_score = score
    return max_score


def get_best_student_score(student, company):
    """
    Retourne le meilleur score caché d'un étudiant pour les offres d'une entreprise.
    Utilisé côté entreprise pour trier les étudiants.
    """
    return get_best_company_score(student, company)
