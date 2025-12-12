"""
Management command pour créer des données de démo
Usage: docker compose exec web python manage.py setup_demo
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Student, Company, Skill, Match, Interview, Swipe, InternshipOffer
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
            
        # 1. Créer les compétences d'abord
        self.stdout.write('🎯 Création des compétences...')
        skills_data = ['React', 'TypeScript', 'Python', 'Django', 'Node.js', 'Tailwind CSS', 'Git', 'Docker', 'PostgreSQL', 'AWS', 'Figma', 'Vue.js', 'Java', 'Kubernetes']
        skills = {}
        for skill_name in skills_data:
            skill, _ = Skill.objects.get_or_create(name=skill_name)
            skills[skill_name] = skill
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(skills_data)} compétences créées'))

        # 2. Créer 3 étudiants
        self.stdout.write('👤 Création des 3 étudiants...')
        students_data = [
            {
                'username': 'marie.dupont',
                'email': 'marie.dupont@polytech.fr',
                'password': 'test123',
                'first_name': 'Marie',
                'last_name': 'Dupont',
                'school': 'Polytech Lyon',
                'school_url': 'https://www.polytech-lyon.fr',
                'program': 'Master Informatique - Spécialité Web',
                'year': 'M1',
                'gender': 'F',
                'preferences': 'Passionnée par le développement web et mobile, je recherche une alternance pour mettre en pratique mes compétences en React, TypeScript et Django. Motivée et créative, j\'aime travailler en équipe sur des projets innovants.',
                'availability': 'Septembre 2024',
                'duration': '12 mois',
                'education': 'Master 1 Informatique - Spécialité Web à Polytech Lyon. Formation complète en développement full-stack, architecture logicielle et gestion de projet agile.',
                'experience': 'Stage de 3 mois en tant que développeuse React chez TechCorp (2023). Développement d\'une application de gestion interne utilisée par 200+ employés.',
                'hobbies': 'Présidente du BDE, participation à 3 Hackathons (1er prix 2023), Photographie urbaine, Escalade de bloc.',
                'linkedin_url': 'https://linkedin.com/in/marie-dupont',
                'github_url': 'https://github.com/marie-dupont',
                'website_url': 'https://marie-dupont.dev',
                'location': 'Lyon, France',
                'languages': 'Français, Anglais, Espagnol',
                'phone': '+33 6 12 34 56 78',
                'photo_visible': True,
                'skills': ['React', 'TypeScript', 'Python', 'Django', 'Git', 'Tailwind CSS'],
            },
            {
                'username': 'lucas.martin',
                'email': 'lucas.martin@insa.fr',
                'password': 'test123',
                'first_name': 'Lucas',
                'last_name': 'Martin',
                'school': 'INSA Lyon',
                'school_url': 'https://www.insa-lyon.fr',
                'program': 'Génie Informatique',
                'year': 'M2',
                'gender': 'M',
                'preferences': 'Développeur backend passionné, je recherche un stage de fin d\'études pour perfectionner mes compétences en architecture distribuée et DevOps.',
                'availability': 'Février 2025',
                'duration': '6 mois',
                'education': 'Master 2 Génie Informatique à l\'INSA Lyon. Spécialisation en systèmes distribués et cloud computing.',
                'experience': 'Alternance de 2 ans chez Sopra Steria en tant que développeur Java/Spring. Développement de microservices pour le secteur bancaire.',
                'hobbies': 'Contributeur open source, jeux vidéo compétitifs, course à pied.',
                'linkedin_url': 'https://linkedin.com/in/lucas-martin-dev',
                'github_url': 'https://github.com/lucas-martin',
                'website_url': '',
                'location': 'Villeurbanne, France',
                'languages': 'Français, Anglais',
                'phone': '+33 6 98 76 54 32',
                'photo_visible': False,
                'skills': ['Java', 'Python', 'Docker', 'Kubernetes', 'PostgreSQL', 'AWS'],
            },
            {
                'username': 'emma.bernard',
                'email': 'emma.bernard@epitech.eu',
                'password': 'test123',
                'first_name': 'Emma',
                'last_name': 'Bernard',
                'school': 'Epitech Lyon',
                'school_url': 'https://www.epitech.eu',
                'program': 'Tek4 - Expert en Technologies de l\'Information',
                'year': 'M1',
                'gender': 'F',
                'preferences': 'Designer et développeuse frontend, je cherche à combiner mes compétences en UX/UI avec le développement d\'interfaces modernes.',
                'availability': 'Avril 2025',
                'duration': '4-6 mois',
                'education': 'Epitech Lyon - 4ème année. Expérience internationale (1 an à Séoul). Spécialisation UX/UI et développement frontend.',
                'experience': 'Stage de 6 mois chez Ubisoft Lyon en tant que UI Developer. Création d\'interfaces pour jeux mobiles.',
                'hobbies': 'Design graphique, illustration digitale, voyages, photographie.',
                'linkedin_url': 'https://linkedin.com/in/emma-bernard-ux',
                'github_url': 'https://github.com/emma-b-design',
                'website_url': 'https://emma-bernard.design',
                'location': 'Lyon, France',
                'languages': 'Français, Anglais, Coréen (notions)',
                'phone': '+33 7 11 22 33 44',
                'photo_visible': True,
                'skills': ['React', 'Vue.js', 'TypeScript', 'Figma', 'Tailwind CSS', 'Git'],
            },
        ]

        students = []
        for student_data in students_data:
            # Créer l'utilisateur
            user, user_created = User.objects.get_or_create(
                username=student_data['username'],
                defaults={
                    'email': student_data['email'],
                    'first_name': student_data['first_name'],
                    'last_name': student_data['last_name'],
                }
            )
            if user_created:
                user.set_password(student_data['password'])
                user.save()
                self.stdout.write(self.style.SUCCESS(f'  ✓ User créé: {student_data["username"]}'))
            
            # Créer le profil étudiant
            student, created = Student.objects.get_or_create(
                user=user,
                defaults={
                    'school': student_data['school'],
                    'school_url': student_data['school_url'],
                    'program': student_data['program'],
                    'year': student_data['year'],
                    'gender': student_data['gender'],
                    'preferences': student_data['preferences'],
                    'availability': student_data['availability'],
                    'duration': student_data['duration'],
                    'education': student_data['education'],
                    'experience': student_data['experience'],
                    'hobbies': student_data['hobbies'],
                    'theme': 'dark',
                    'linkedin_url': student_data['linkedin_url'],
                    'github_url': student_data['github_url'],
                    'website_url': student_data['website_url'],
                    'location': student_data['location'],
                    'languages': student_data['languages'],
                    'phone': student_data['phone'],
                    'photo_visible': student_data['photo_visible'],
                }
            )
            
            if not created:
                # Mettre à jour tous les champs
                for field in ['school', 'school_url', 'program', 'year', 'gender', 'preferences', 
                              'availability', 'duration', 'education', 'experience', 'hobbies',
                              'linkedin_url', 'github_url', 'website_url', 'location', 'languages', 'phone', 'photo_visible']:
                    setattr(student, field, student_data.get(field, getattr(student, field)))
                student.save()
            
            # Ajouter les compétences
            for skill_name in student_data['skills']:
                if skill_name in skills:
                    student.skills.add(skills[skill_name])
            
            students.append(student)
            self.stdout.write(self.style.SUCCESS(f'  ✓ Profil étudiant: {student_data["first_name"]} {student_data["last_name"]}'))

        # 3. Créer 3 entreprises AVEC utilisateurs
        self.stdout.write('🏢 Création des 3 entreprises...')
        companies_data = [
            {
                'username': 'innovatech',
                'email': 'contact@innovatech.com',
                'password': 'test123',
                'name': 'Innovatech Solutions',
                'sector': 'Tech / SaaS',
                'description': 'Startup innovante spécialisée dans le développement de solutions web modernes. Nous créons des applications qui changent la vie des utilisateurs.',
                'website': 'https://innovatech.example.com',
                'contact_email': 'recrutement@innovatech.com',
                'contact_name': 'Sophie Martin',
                'address': '123 Avenue de la Tech, Lyon',
                'employees': 50,
                'founded_year': 2018,
                'benefits': 'Télétravail flexible, RTT, tickets restaurant, mutuelle premium',
            },
            {
                'username': 'creativeminds',
                'email': 'contact@creativeminds.com',
                'password': 'test123',
                'name': 'Creative Minds',
                'sector': 'Design / UX',
                'description': 'Agence de design récompensée, spécialisée dans l\'UX/UI et le branding. Nous créons des expériences utilisateur exceptionnelles.',
                'website': 'https://creativeminds.example.com',
                'contact_email': 'jobs@creativeminds.com',
                'contact_name': 'Thomas Bernard',
                'address': '45 Rue du Design, Lyon',
                'employees': 25,
                'founded_year': 2015,
                'benefits': 'Environnement créatif, formation continue, prime d\'intéressement',
            },
            {
                'username': 'dataflow',
                'email': 'contact@dataflow.com',
                'password': 'test123',
                'name': 'DataFlow Analytics',
                'sector': 'Data Science / IA',
                'description': 'Leader en analyse de données et intelligence artificielle. Nous transformons les données en insights actionnables.',
                'website': 'https://dataflow.example.com',
                'contact_email': 'careers@dataflow.com',
                'contact_name': 'Julie Rousseau',
                'address': '78 Boulevard de la Data, Villeurbanne',
                'employees': 120,
                'founded_year': 2012,
                'benefits': 'Salaire compétitif, participation, CE, salle de sport',
            },
        ]

        companies = []
        for company_data in companies_data:
            # Créer l'utilisateur pour l'entreprise
            company_user, user_created = User.objects.get_or_create(
                username=company_data['username'],
                defaults={
                    'email': company_data['email'],
                    'first_name': company_data['name'],
                }
            )
            if user_created:
                company_user.set_password(company_data['password'])
                company_user.save()
                self.stdout.write(self.style.SUCCESS(f'  ✓ User créé: {company_data["username"]}'))
            
            # Créer l'entreprise
            company, created = Company.objects.get_or_create(
                name=company_data['name'],
                defaults={
                    'user': company_user,
                    'sector': company_data['sector'],
                    'description': company_data['description'],
                    'website': company_data['website'],
                    'contact_email': company_data['contact_email'],
                    'contact_name': company_data['contact_name'],
                    'address': company_data.get('address', ''),
                    'employees': company_data.get('employees'),
                    'founded_year': company_data.get('founded_year'),
                    'benefits': company_data.get('benefits', ''),
                }
            )
            if not created and not company.user:
                company.user = company_user
                company.save()
            
            companies.append(company)
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Entreprise créée: {company.name}'))

        # 4. Créer des offres de stage pour chaque entreprise
        self.stdout.write('📝 Création des offres de stage...')
        offers_data = [
            {
                'company_index': 0,
                'title': 'Stage Développeur Full-Stack React/Django',
                'description': 'Rejoignez notre équipe pour développer des applications web modernes.',
                'location': 'Lyon (hybride)',
                'duration': '6 mois',
                'requirements': 'Connaissance de React, TypeScript. Python/Django est un plus.',
            },
            {
                'company_index': 0,
                'title': 'Stage DevOps Junior',
                'description': 'Participez à la mise en place de notre infrastructure cloud.',
                'location': 'Lyon',
                'duration': '4-6 mois',
                'requirements': 'Bases en Linux, intérêt pour le cloud.',
            },
            {
                'company_index': 1,
                'title': 'Stage UX/UI Designer',
                'description': 'Création de maquettes et prototypes interactifs.',
                'location': 'Lyon',
                'duration': '6 mois',
                'requirements': 'Maîtrise de Figma, portfolio requis.',
            },
            {
                'company_index': 2,
                'title': 'Stage Data Analyst',
                'description': 'Analyse de données et création de dashboards.',
                'location': 'Villeurbanne',
                'duration': '6 mois',
                'requirements': 'Python, SQL, statistiques.',
            },
        ]
        
        for offer_data in offers_data:
            company = companies[offer_data['company_index']]
            InternshipOffer.objects.get_or_create(
                company=company,
                title=offer_data['title'],
                defaults={
                    'description': offer_data['description'],
                    'location': offer_data['location'],
                    'duration': offer_data['duration'],
                    'requirements': offer_data['requirements'],
                }
            )
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(offers_data)} offres créées'))

        # Résumé
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('✅ DONNÉES DE DÉMO CRÉÉES AVEC SUCCÈS !'))
        self.stdout.write('='*50)
        self.stdout.write('\n📋 Comptes Étudiants:')
        for s in students_data:
            self.stdout.write(f'  • {s["username"]} / test123 ({s["first_name"]} {s["last_name"]})')
        self.stdout.write('\n📋 Comptes Entreprises:')
        for c in companies_data:
            self.stdout.write(f'  • {c["username"]} / test123 ({c["name"]})')
        self.stdout.write('\n📋 Admin:')
        self.stdout.write('  • admin / admin123')
        self.stdout.write(f'\n📊 Statistiques:')
        self.stdout.write(f'  • Étudiants: {len(students)}')
        self.stdout.write(f'  • Entreprises: {len(companies)}')
        self.stdout.write(f'  • Offres de stage: {InternshipOffer.objects.count()}')
        self.stdout.write(f'  • Compétences: {len(skills_data)}')
        self.stdout.write('\n🚀 Prêt à tester l\'application!')
