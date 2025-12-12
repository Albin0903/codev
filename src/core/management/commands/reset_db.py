"""
Management command pour réinitialiser la base de données avec les données de base uniquement
Usage: docker compose exec web python manage.py reset_db
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Student, Company, Skill, Match, Interview, Swipe, CompanySwipe, InternshipOffer
from django.db import connection


class Command(BaseCommand):
    help = 'Réinitialise la base de données avec les profils de base uniquement'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force la suppression sans confirmation',
        )

    def handle(self, *args, **options):
        if not options['force']:
            confirm = input('⚠️  Cette action va supprimer TOUS les matchs, swipes et entretiens. Continuer? (y/n): ')
            if confirm.lower() != 'y':
                self.stdout.write(self.style.WARNING('❌ Annulé'))
                return

        self.stdout.write(self.style.SUCCESS('🔄 Réinitialisation de la base de données...'))

        # Supprimer les matchs, swipes et entretiens
        Interview.objects.all().delete()
        Match.objects.all().delete()
        Swipe.objects.all().delete()
        CompanySwipe.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS('  ✓ Matchs, swipes et entretiens supprimés'))

        # Garder les utilisateurs et profils, réinitialiser les offres
        InternshipOffer.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('  ✓ Offres de stage supprimées'))

        # Recréer les offres pour chaque entreprise
        companies = Company.objects.all()
        for company in companies:
            if company.name == 'Innovatech Solutions':
                InternshipOffer.objects.create(
                    company=company,
                    title='Stage Développeur Full-Stack React/Django',
                    description='Rejoignez notre équipe pour développer des applications web modernes. Vous travaillerez sur React, TypeScript, Django REST Framework et PostgreSQL.',
                    location='Lyon (hybride)',
                    duration='6 mois',
                    requirements='Connaissance de React, TypeScript. Python/Django est un plus.',
                )
                InternshipOffer.objects.create(
                    company=company,
                    title='Stage DevOps Junior',
                    description='Participez à la mise en place de notre infrastructure cloud (AWS, Docker, Kubernetes). Formation assurée.',
                    location='Lyon',
                    duration='4-6 mois',
                    requirements='Bases en Linux, intérêt pour le cloud et l\'automatisation.',
                )
            elif company.name == 'Creative Minds':
                InternshipOffer.objects.create(
                    company=company,
                    title='Stage UX/UI Designer',
                    description='Création de maquettes, prototypes interactifs et tests utilisateurs pour nos clients premium.',
                    location='Lyon',
                    duration='6 mois',
                    requirements='Maîtrise de Figma, portfolio requis.',
                )
            elif company.name == 'DataFlow Analytics':
                InternshipOffer.objects.create(
                    company=company,
                    title='Stage Data Analyst',
                    description='Analyse de données, création de dashboards et reporting pour nos clients. Travail avec Python, SQL et Power BI.',
                    location='Villeurbanne',
                    duration='6 mois',
                    requirements='Python, SQL, statistiques.',
                )

        self.stdout.write(self.style.SUCCESS('  ✓ Offres de stage recréées'))

        # Afficher les comptes disponibles
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('✅ BASE DE DONNÉES RÉINITIALISÉE !'))
        self.stdout.write('='*50)
        self.stdout.write('\n📋 Comptes disponibles:')
        self.stdout.write('\n  Étudiants:')
        self.stdout.write('    • marie.dupont / test123')
        self.stdout.write('    • lucas.martin / test123')
        self.stdout.write('    • emma.bernard / test123')
        self.stdout.write('\n  Entreprises:')
        self.stdout.write('    • innovatech / test123')
        self.stdout.write('    • creativeminds / test123')
        self.stdout.write('    • dataflow / test123')
        self.stdout.write('\n💡 Prêt à tester le swipe!')
