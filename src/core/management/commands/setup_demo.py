"""
Management command pour créer des données de démo
Usage: docker compose exec web python manage.py setup_demo
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Student, Company, Skill, Match, Interview, Swipe, InternshipOffer, Forum
from datetime import datetime, timedelta, date, time
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
                'role': 'etudiant',
                'availability': 'Septembre 2024',
                'duration': '12 mois',
                'about': "Étudiante en Master 1 Informatique à Polytech Lyon, je suis passionnée par le développement web fullstack. J'ai une première expérience en React et je souhaite approfondir mes connaissances en architecture logicielle.",
                'education': [
                    {"school": "Université Lyon 1", "degree": "Licence Informatique", "year": "2020-2023", "description": "Mention Bien"},
                    {"school": "Polytech Lyon", "degree": "Master 1 Informatique", "year": "2024-2025", "description": "Spécialité Web et IA"}
                ],
                'experience': [
                    {"company": "TechCorp", "position": "Développeuse React", "duration": "Stage, 2023", "description": "Développement d'une application de gestion interne."},
                    {"company": "WebStudio", "position": "Assistante Frontend", "duration": "2022", "description": "Intégration UI et tests."}
                ],
                'hobbies': ["Présidente du BDE", "Hackathons (1er prix 2023)", "Photographie urbaine", "Escalade de bloc"],
                'linkedin_url': '',
                'github_url': '',
                'website_url': '',
                'location': 'Lyon, France',
                'languages': [{"language": "Français", "level": "Langue maternelle"}, {"language": "Anglais", "level": "C1"}, {"language": "Espagnol", "level": "B2"}],
                'phone': '+33 6 12 34 56 78',
                'photo_visible': True,
                'skills': ['React', 'TypeScript', 'Python', 'Django', 'Git'],
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
                'role': 'alternant',
                'availability': 'Février 2025',
                'duration': '6 mois',
                'about': "Futur ingénieur INSA Lyon, spécialisé en backend et cloud computing. Je cherche un stage de fin d'études challengeant.",
                'education': [
                    {"school": "INSA Lyon", "degree": "Licence Informatique", "year": "2019-2022", "description": ""},
                    {"school": "INSA Lyon", "degree": "Master 2 Génie Informatique", "year": "2024-2025", "description": ""}
                ],
                'experience': [
                    {"company": "Sopra Steria", "position": "Développeur Java/Spring", "duration": "Alternance, 2023-2025", "description": "Microservices bancaires."},
                    {"company": "PME locale", "position": "Technicien Systèmes", "duration": "2022", "description": "Support et scripts."}
                ],
                'hobbies': ["Contributeur open source", "Jeux vidéo compétitifs", "Course à pied"],
                'linkedin_url': '',
                'github_url': '',
                'website_url': '',
                'location': 'Villeurbanne, France',
                'languages': [{"language": "Français", "level": "Langue maternelle"}, {"language": "Anglais", "level": "C2"}],
                'phone': '+33 6 98 76 54 32',
                'photo_visible': False,
                'skills': ['Java', 'Python', 'Docker', 'Kubernetes', 'PostgreSQL'],
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
                'role': 'apprenti',
                'availability': 'Avril 2025',
                'duration': '4-6 mois',
                'about': "Passionnée par l'UX/UI et le frontend, je crée des expériences utilisateurs fluides et esthétiques.",
                'education': [
                    {"school": "Epitech", "degree": "Bachelor Informatique", "year": "2019-2022", "description": ""},
                    {"school": "Epitech Lyon", "degree": "Tek4", "year": "2024-2025", "description": "Parcours UX/UI"}
                ],
                'experience': [
                    {"company": "Ubisoft Lyon", "position": "UI Developer", "duration": "Stage, 2024", "description": "Interfaces pour jeux mobiles."},
                    {"company": "Freelance", "position": "Frontend Developer", "duration": "2023", "description": "Sites vitrines et dashboards."}
                ],
                'hobbies': ["Design graphique", "Illustration digitale", "Voyages", "Photographie"],
                'linkedin_url': '',
                'github_url': '',
                'website_url': '',
                'location': 'Lyon, France',
                'languages': [{"language": "Français", "level": "Langue maternelle"}, {"language": "Anglais", "level": "B2"}, {"language": "Coréen", "level": "Notions"}],
                'phone': '+33 7 11 22 33 44',
                'photo_visible': True,
                'skills': ['React', 'Vue.js', 'TypeScript', 'Figma', 'Tailwind CSS'],
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
                    'role': student_data['role'],
                    'availability': student_data['availability'],
                    'duration': student_data['duration'],
                    'education': student_data['education'],
                    'experience': student_data['experience'],
                    'hobbies': student_data['hobbies'],
                    'about': student_data.get('about', ''),
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
                for field in ['school', 'school_url', 'program', 'year', 'role',
                              'availability', 'duration', 'education', 'experience', 'hobbies', 'about',
                              'linkedin_url', 'github_url', 'website_url', 'location', 'languages', 'phone', 'photo_visible']:
                    setattr(student, field, student_data.get(field, getattr(student, field)))
                student.save()
            
            # Ajouter les compétences (max 5)
            for skill_name in student_data['skills'][:5]:
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

        # 5. Créer le Forum
        self.stdout.write('📅 Création du forum...')
        forum_date = date.today() + timedelta(days=7)  # Forum dans 7 jours
        forum, forum_created = Forum.objects.get_or_create(
            name='Forum Entreprises Polytech Lyon 2026',
            defaults={
                'date': forum_date,
                'start_time': time(9, 0),
                'end_time': time(17, 0),
                'location': 'Polytech Lyon - Campus LyonTech La Doua',
                'address': '15 Boulevard André Latarjet, 69100 Villeurbanne',
                'description': 'Forum annuel de recrutement réunissant les entreprises et étudiants de Polytech Lyon. Rencontrez plus de 50 entreprises et trouvez votre stage ou alternance !',
                'is_active': True,
            }
        )
        if forum_created:
            self.stdout.write(self.style.SUCCESS(f'  ✓ Forum créé: {forum.name} le {forum.date}'))
        else:
            self.stdout.write(f'  ℹ Forum existant: {forum.name}')

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
