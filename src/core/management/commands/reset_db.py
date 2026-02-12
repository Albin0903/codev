"""
Management command pour réinitialiser la base de données avec les données de base uniquement
Usage: docker compose exec web python manage.py reset_db
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth.models import User
from core.models import Student, Company, Skill, Match, Interview, Swipe, CompanySwipe, InternshipOffer, MatchScore
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
            confirm = input('⚠️  Cette action va supprimer TOUS les matchs, swipes, entretiens et scores. Continuer? (y/n): ')
            if confirm.lower() != 'y':
                self.stdout.write(self.style.WARNING('❌ Annulé'))
                return

        self.stdout.write(self.style.SUCCESS('🔄 Réinitialisation de la base de données...'))

        # Supprimer les matchs, swipes, entretiens et scores
        Interview.objects.all().delete()
        Match.objects.all().delete()
        Swipe.objects.all().delete()
        CompanySwipe.objects.all().delete()
        MatchScore.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS('  ✓ Matchs, swipes, entretiens et scores supprimés'))

        # Garder les utilisateurs et profils, réinitialiser les offres
        InternshipOffer.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('  ✓ Offres de stage supprimées'))

        # Recréer les offres pour chaque entreprise en utilisant setup_demo
        self.stdout.write(self.style.SUCCESS('🔄 Exécution de setup_demo pour créer les offres détaillées...'))
        call_command('setup_demo')
        
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
