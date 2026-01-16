from datetime import datetime, time, timedelta
from .models import Match, Interview

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