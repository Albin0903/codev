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
            
            # Créer l'entreprise (Note: Le champ User a été supprimé du modèle Company)
            company, created = Company.objects.get_or_create(
                name=company_data['name'],
                defaults={
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
            
            companies.append(company)
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Entreprise créée: {company.name}'))

        # 4. Créer des offres de stage pour chaque entreprise
        self.stdout.write('📝 Création des offres de stage...')
        offers_data = [
            {
                'company_index': 0, 
                'title': 'Stage Développeur Full-Stack React/Django',
                'description': '''Au sein de la feature team "Core Product", vous participerez activement au développement de notre plateforme SaaS.

Missions :
- Conception et développement de nouvelles fonctionnalités front-end avec React 19 et Tailwind CSS
- Création d'API REST performantes avec Django REST Framework
- Participation aux Code Reviews et aux rituels agiles (Daily, Retro, Poker Planning)
- Écriture de tests unitaires et d'intégration (Jest, Pytest)

Environnement : Équipe de 5 devs, CI/CD GitLab, Docker, AWS.''',
                'location': 'Lyon 7ème (hybride 2j/semaine)',
                'duration': '6 mois (pré-embauche possible)',
                'requirements': 'Étudiant(e) en dernière année d\'école d\'ingénieur. Bonne maîtrise de JS/TS et React. Notions de Python/Django. Sensibilité UX/UI. Curiosité et autonomie.',
            },
            {
                'company_index': 0,
                'title': 'Stage DevOps Junior / Cloud Infrastructure',
                'description': '''Intégré(e) à l'équipe SRE, vous aiderez à industrialiser nos déploiements et surveiller notre infrastructure.

Missions :
- Automatisation des déploiements via Ansible et Terraform
- Amélioration des pipelines CI/CD sous GitLab CI
- Mise en place de sondes de monitoring (Prometheus + Grafana)
- Conteneurisation des microservices existants (Docker, Kubernetes)

Environnement : Linux, AWS (EC2, S3, RDS), K8s, Python, Bash.''',
                'location': 'Lyon 7ème',
                'duration': '6 mois',
                'requirements': 'Passionné(e) par l\'infra-as-code et l\'automatisation. Connaissance de Linux et Docker indispensable. Une première expérience avec un Cloud provider (AWS/GCP) est un plus.',
            },
            {
                'company_index': 1,
                'title': 'Stage UX/UI Designer - Design System',
                'description': '''Rejoignez l'équipe Design de Creative Minds pour repenser l'expérience digitale de nos clients grands comptes.

Missions :
- Création de wireframes et maquettes haute-fidélité sur Figma
- Participation à la refonte de notre Design System interne
- Réalisation de tests utilisateurs et analyse des parcours
- Collaboration étroite avec les développeurs front-end pour l'intégration

Projets : App mobile bancaire, Dashboard e-commerce, Site vitrine de luxe.''',
                'location': 'Lyon 2ème (Presqu\'île)',
                'duration': '6 mois',
                'requirements': 'Portfolio créatif obligatoire. Maîtrise avancée de Figma (Auto-layout, Components). Notions de HTML/CSS appréciées pour dialoguer avec les devs.',
            },
            {
                'company_index': 1,
                'title': 'Stage Développeur Front-End Créatif (Three.js)',
                'description': '''Pour nos projets "Wwaaaaouh Effect", nous cherchons un développeur passionné par le webGL et les interactions avancées.

Missions :
- Intégration de maquettes complexes avec soin du détail (pixel perfect)
- Création d'expériences immersives 3D avec Three.js / R3F
- Optimisation des performances (Lighthouse, Core Web Vitals)
- Animations fluides avec GSAP / Framer Motion

Stack : React, Next.js, WebGL, Tailwind.''',
                'location': 'Lyon 2ème',
                'duration': '6 mois',
                'requirements': 'Forte sensibilité créative. Vous aimez quand ça bouge à 60fps. Maîtrise de React et d\'une lib d\'animation.',
            },
            {
                'company_index': 2,
                'title': 'Stage Data Scientist - NLP & LLM',
                'description': '''Dans le pôle R&D, vous travaillerez sur l'intégration de modèles de langage (LLM) pour nos outils d'analyse documentaire.

Missions :
- Fine-tuning de modèles (Llama 3, Mistral) sur des données sectorielles
- Développement de pipelines RAG (Retrieval Augmented Generation)
- Analyse de sentiment sur des flux de données massifs
- Veille technologique active sur l'IA générative

Environnement : Python, PyTorch, Hugging Face, LangChain, Elasticsearch.''',
                'location': 'Villeurbanne (Doua)',
                'duration': '6 mois (Stage de fin d\'études)',
                'requirements': 'Solides bases mathématiques et statistiques. Maîtrise de Python et des bibliothèques ML (Scikit-learn, Pandas, PyTorch). Intérêt marqué pour le NLP.',
            },
            {
                'company_index': 2,
                'title': 'Stage Data Engineer - Big Data',
                'description': '''Vous rejoignez l'équipe Data Platform pour construire les pipelines de données de demain.

Missions :
- Développement de pipelines ETL avec Apache Spark et Airflow
- Modélisation de Data Warehouses (Snowflake / BigQuery)
- Optimisation des requêtes SQL complexes
- Mise en qualité de la donnée (Data Quality)

Stack : Python, Scala, SQL, Spark, Docker, AWS Glue.''',
                'location': 'Villeurbanne',
                'duration': '6 mois',
                'requirements': 'Profil technique fort. Maîtrise de SQL et Python. Curiosité pour les architectures distribuées. Rigueur et bonnes pratiques de code.',
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
