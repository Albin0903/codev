def simple_match(student, companies):
    """Retourne une liste (company, score) triée par score décroissant.

    Heuristique simple et robuste par rapport aux modèles actuels :
    - +1 par compétence de l'étudiant retrouvée dans les offres de l'entreprise (title/requirements/description)
    - +1 si la localisation de l'étudiant matche l'adresse de l'entreprise ou la localisation d'une offre
    """

    try:
        student_skill_names = set(student.skills.values_list('name', flat=True))
    except Exception:
        student_skill_names = set()

    student_location = (getattr(student, 'location', '') or '').strip().lower()

    matches = []
    for company in companies:
        score = 0

        offers_text = []
        try:
            for offer in company.offers.all():
                offers_text.append(offer.title or '')
                offers_text.append(offer.requirements or '')
                offers_text.append(offer.description or '')
                offers_text.append(offer.location or '')
        except Exception:
            pass

        haystack = (' '.join(offers_text)).lower()
        for skill_name in student_skill_names:
            if skill_name and skill_name.lower() in haystack:
                score += 1

        if student_location:
            company_address = (getattr(company, 'address', '') or '').lower()
            if student_location in company_address or student_location in haystack:
                score += 1

        matches.append((company, score))

    matches.sort(key=lambda x: x[1], reverse=True)
    return matches
from datetime import datetime, time, timedelta
from .models import Match, Interview
import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import maximum_bipartite_matching

def get_anti_stress_slots_order(total_slots):
    """Génère les index des créneaux en partant du centre."""
    middle = (total_slots - 1) // 2
    order = []
    for i in range(total_slots):
        if i == 0:
            order.append(middle)
        else:
            if middle + i < total_slots:
                order.append(middle + i)
            if middle - i >= 0:
                order.append(middle - i)
    return order

def plan_student_interviews(student):
    """Planifie les entretiens pour un étudiant donné en fonction de ses matchs et priorités."""

    matches = Match.objects.filter(
        student=student, 
        student_priority__gt=0
    ).order_by('student_priority')

    start_dt = datetime.combine(datetime.now().date(), time(9, 0))
    slot_duration = 20
    total_slots_available = 6 # de 9h à 13h par exemple
    
    slots = [start_dt + timedelta(minutes=i*slot_duration) for i in range(total_slots_available)]
    
    filling_order = get_anti_stress_slots_order(len(slots))
    
    interviews_created = []
    for index, match in enumerate(matches):
        if index < len(filling_order):
            slot_index = filling_order[index]
            planned_time = slots[slot_index]
            
            interview, created = Interview.objects.update_or_create(
                match=match,
                defaults={
                    'time_slot': planned_time,
                    'status': 'pending'
                }
            )
            interviews_created.append(interview)
            print(f"DEBUG: Interview planifiée à {planned_time} pour {match.company.name}", flush=True)
            
    return interviews_created

def create_scoring_matrix(students, companies, likes):
    """
    Crée une matrice de scoring entre étudiants et entreprises.
    """
    n_students = len(students)
    n_companies = len(companies)
    scoring_matrix = np.zeros((n_students, n_companies))

    for student in students:
        for company in companies:
            student_like = likes.get((student.id, company.id), 0)  # 1 si étudiant like, 0 sinon
            company_like = likes.get((company.id, student.id), 0)  # 1 si entreprise like, 0 sinon

            if student_like and company_like:
                score = 3  # Score élevé
            elif not student_like and company_like:
                score = 2  # Score moyen
            elif student_like and not company_like:
                score = 1  # Score faible
            else:
                score = 0  # Score nul

            scoring_matrix[students.index(student), companies.index(company)] = score

    return csr_matrix(scoring_matrix)

def perform_matching(scoring_matrix, students, companies):
    """
    Effectue le matching bipartite entre étudiants et entreprises.
    """
    matching = maximum_bipartite_matching(scoring_matrix, perm_type='column')
    schedule = []

    for idx, company_idx in enumerate(matching):
        if company_idx != -1:
            student = students[idx]
            company = companies[company_idx]
            schedule.append({"student": student, "company": company})

    return schedule