"""
Management command pour créer des données de démo
Usage: docker compose exec web python manage.py setup_demo
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Student, Company, Skill, Match, Interview, Swipe
from datetime import datetime, timedelta
from django.utils import timezone


class Command(BaseCommand):
    help = 'Crée des données de démo pour tester l\'application'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Création des données de démo...'))
        
        # 0. Créer un superutilisateur admin si nécessaire
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@test.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            
        # 1. Créer un utilisateur étudiant
        self.stdout.write('👤 Création de l\'utilisateur étudiant...')
        user, created = User.objects.get_or_create(
            username='etudiant',
            defaults={
                'email': 'etudiant@test.com',
                'first_name': 'Marie',
                'last_name': 'Dupont'
            }
        )
        if created:
            user.set_password('test123')
            user.save()
            self.stdout.write(self.style.SUCCESS('  ✓ Utilisateur créé: etudiant@test.com / test123'))
        else:
            self.stdout.write(self.style.WARNING('  ⚠ Utilisateur existe déjà'))

        # 2. Créer le profil étudiant
        student, created = Student.objects.get_or_create(
            user=user,
            defaults={
                'school': 'Polytech Lyon',
                'school_url': 'https://www.polytech-lyon.fr',
                'program': 'Master Informatique - Spécialité Web',
                'year': 'M1',
                'gender': 'F',
                'preferences': 'Passionnée par le développement web et mobile, je recherche une alternance pour mettre en pratique mes compétences en React, TypeScript et Django. Motivée et créative, j\'aime travailler en équipe sur des projets innovants.',
                'availability': 'Septembre 2024',
                'duration': '12 mois',
                'education': 'Master 1 Informatique - Spécialité Web à Polytech Lyon. Formation complète en développement full-stack, architecture logicielle et gestion de projet agile.',
                'experience': 'Stage de 3 mois en tant que développeuse React chez TechCorp (2023). Développement d\'une application de gestion interne utilisée par 200+ employés. Participation à 3 hackathons avec 1er prix en 2023.',
                'hobbies': 'Président du BDE, participation à 3 Hackathons (1er prix 2023), Photographie urbaine, Escalade de bloc.',
                'theme': 'dark'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('  ✓ Profil étudiant créé'))
        else:
            # Always update demo fields to ensure they are present even if student already exists
            student.school = 'Polytech Lyon'
            student.school_url = 'https://www.polytech-lyon.fr'
            student.program = 'Master Informatique - Spécialité Web'
            student.year = 'M1'
            student.gender = 'F'
            student.preferences = 'Passionnée par le développement web et mobile, je recherche une alternance pour mettre en pratique mes compétences en React, TypeScript et Django. Motivée et créative, j\'aime travailler en équipe sur des projets innovants.'
            student.availability = 'Septembre 2024'
            student.duration = '12 mois'
            student.education = 'Master 1 Informatique - Spécialité Web à Polytech Lyon. Formation complète en développement full-stack, architecture logicielle et gestion de projet agile.'
            student.experience = 'Stage de 3 mois en tant que développeuse React chez TechCorp (2023). Développement d\'une application de gestion interne utilisée par 200+ employés. Participation à 3 hackathons avec 1er prix en 2023.'
            student.hobbies = 'Président du BDE, participation à 3 Hackathons (1er prix 2023), Photographie urbaine, Escalade de bloc.'
            student.theme = 'dark'
            student.save()
            self.stdout.write(self.style.SUCCESS('  ✓ Champs du profil mis à jour'))

        # 3. Créer des compétences
        self.stdout.write('🎯 Création des compétences...')
        skills_data = ['React', 'TypeScript', 'Python', 'Django', 'Node.js', 'Tailwind CSS', 'Git', 'Docker']
        for skill_name in skills_data:
            skill, _ = Skill.objects.get_or_create(name=skill_name)
            student.skills.add(skill)
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(skills_data)} compétences ajoutées'))

        # 4. Créer des entreprises
        self.stdout.write('🏢 Création des entreprises...')
        companies_data = [
            {
                'name': 'Innovatech Solutions',
                'sector': 'Tech / SaaS',
                'description': 'Startup innovante spécialisée dans le développement de solutions web modernes. Nous créons des applications qui changent la vie des utilisateurs.',
                'website': 'https://innovatech.example.com',
                'contact_email': 'recrutement@innovatech.com',
                'contact_name': 'Sophie Martin',
            },
            {
                'name': 'Creative Minds',
                'sector': 'Design / UX',
                'description': 'Agence de design récompensée, spécialisée dans l\'UX/UI et le branding. Nous créons des expériences utilisateur exceptionnelles.',
                'website': 'https://creativeminds.example.com',
                'contact_email': 'jobs@creativeminds.com',
                'contact_name': 'Thomas Bernard',
            },
            {
                'name': 'DataFlow Analytics',
                'sector': 'Data Science / IA',
                'description': 'Leader en analyse de données et intelligence artificielle. Nous transformons les données en insights actionnables.',
                'website': 'https://dataflow.example.com',
                'contact_email': 'careers@dataflow.com',
                'contact_name': 'Julie Rousseau',
            },
        ]

        companies = []
        for company_data in companies_data:
            company, created = Company.objects.get_or_create(
                name=company_data['name'],
                defaults=company_data
            )
            companies.append(company)
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Entreprise créée: {company.name}'))

        # 5. Créer un match avec la première entreprise
        self.stdout.write('💝 Création d\'un match...')
        if companies:
            # Créer un swipe "right" pour la première entreprise
            Swipe.objects.get_or_create(
                student=student,
                company=companies[0],
                defaults={'direction': 'right'}
            )
            
            match, created = Match.objects.get_or_create(
                student=student,
                company=companies[0],
                defaults={'is_mutual': True}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Match créé avec {companies[0].name}'))

                # 6. Créer un entretien
                tomorrow = timezone.now() + timedelta(days=1)
                interview_time = tomorrow.replace(hour=14, minute=0, second=0, microsecond=0)
                
                Interview.objects.get_or_create(
                    match=match,
                    defaults={
                        'time_slot': interview_time,
                        'duration': 30,
                        'room': 'Stand A23',
                        'status': 'confirmed'
                    }
                )
                self.stdout.write(self.style.SUCCESS('  ✓ Entretien programmé pour demain à 14h00'))

        # Résumé
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('✅ DONNÉES DE DÉMO CRÉÉES AVEC SUCCÈS !'))
        self.stdout.write('='*50)
        self.stdout.write('\n📋 Résumé:')
        self.stdout.write(f'  • Utilisateur: etudiant@test.com')
        self.stdout.write(f'  • Mot de passe: test123')
        self.stdout.write(f'  • Entreprises: {len(companies)}')
        self.stdout.write(f'  • Compétences: {len(skills_data)}')
        self.stdout.write(f'  • Matchs: {Match.objects.filter(student=student).count()}')
        self.stdout.write(f'  • Entretiens: {Interview.objects.filter(match__student=student).count()}')
        self.stdout.write('\n🚀 Vous pouvez maintenant tester l\'application!')
        self.stdout.write('  → Frontend: http://localhost:3000')
        self.stdout.write('  → API: http://localhost:8000/api/')
        self.stdout.write('  → Admin: http://localhost:8000/admin/')
