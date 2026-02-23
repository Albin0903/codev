import numpy as np
from datetime import datetime, time, timedelta
from django.db import transaction
from .models import Student, Company, Swipe, CompanySwipe, Interview, Match
from .logic.MatchingCore import MatchingEngine

def get_anti_stress_slots_order(total_slots):
    """Calcule l'ordre des créneaux en partant du centre (Anti-Stress)"""
    if total_slots <= 0: return []
    middle = (total_slots - 1) // 2
    order = [middle]
    for i in range(1, total_slots):
        if middle + i < total_slots: order.append(middle + i)
        if middle - i >= 0: order.append(middle - i)
    return order

def run_global_smart_matching():
    """
    Calcule le planning optimal pour TOUT le forum en utilisant 
    le matching biparti et la logique Anti-Stress.
    """
    # 1. Préparation des données
    students = list(Student.objects.all())
    companies = list(Company.objects.all())
    
    if not students or not companies:
        return {"error": "Liste d'étudiants ou d'entreprises vide."}

    # 2. Construction de la matrice des poids (Scores)
    # Lignes = Entreprises, Colonnes = Étudiants
    weights = np.zeros((len(companies), len(students)))

    for c_idx, company in enumerate(companies):
        for s_idx, student in enumerate(students):
            # On calcule le score basé sur les swipes
            s_liked = Swipe.objects.filter(student=student, company=company, direction='right').exists()
            c_liked = CompanySwipe.objects.filter(company=company, student=student, direction='right').exists()
            
            if s_liked and c_liked:
                weights[c_idx, s_idx] = 3  # Match Mutuel : Priorité maximale
            elif c_liked:
                weights[c_idx, s_idx] = 2  # L'entreprise est intéressée : Score moyen
            elif s_liked:
                weights[c_idx, s_idx] = 1  # L'étudiant est intéressé : Score faible

    # 3. Exécution de l'algorithme de Matching Biparti (Scipy)
    engine = MatchingEngine(weights)
    iterations = engine.get_optimized_pairs()

    # 4. Paramètres du planning (Anti-Stress)
    start_dt = datetime.combine(datetime.now().date(), time(14, 0)) # Début à 14h
    slot_duration = 20 # minutes par entretien
    
    # On calcule l'ordre des créneaux (le milieu de journée d'abord)
    total_needed_slots = len(iterations)
    filling_order = get_anti_stress_slots_order(total_needed_slots)

    # 5. Enregistrement sécurisé en base de données
    with transaction.atomic():
        # Optionnel : On peut supprimer les anciens entretiens "pending" avant de recalculer
        # Interview.objects.filter(status='pending').delete()

        for iter_idx, matching in enumerate(iterations):
            # On récupère l'index temporel selon la logique Anti-Stress
            # Si iter_idx=0 (la meilleure itération), on prend le milieu de journée.
            slot_index = filling_order[iter_idx] if iter_idx < len(filling_order) else iter_idx
            planned_time = start_dt + timedelta(minutes=slot_index * slot_duration)

            for comp_idx, std_idx in enumerate(matching):
                if std_idx != -1:
                    student = students[std_idx]
                    company = companies[comp_idx]
                    
                    # On s'assure que l'objet Match existe
                    match, _ = Match.objects.get_or_create(student=student, company=company)
                    
                    # On crée ou met à jour l'entretien
                    Interview.objects.update_or_create(
                        match=match,
                        defaults={
                            'time_slot': planned_time,
                            'status': 'pending'
                        }
                    )
    
    return {"status": "success", "slots_count": total_needed_slots}