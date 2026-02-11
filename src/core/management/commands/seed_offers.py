"""\
Management command pour générer des offres de stage de test.

Usage:
  docker compose exec web python manage.py seed_offers
  docker compose exec web python manage.py seed_offers --count 10
  docker compose exec web python manage.py seed_offers --company innovatech --count 5
  docker compose exec web python manage.py seed_offers --seed 123
"""

from __future__ import annotations

import random
from typing import Optional

from django.core.management.base import BaseCommand, CommandError
from django.db.models import Q

from core.models import Company, InternshipOffer


class Command(BaseCommand):
    help = "Génère des offres de stage (InternshipOffer) pour tester le matching et l'UI."

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=5,
            help="Nombre d'offres à créer par entreprise (défaut: 5)",
        )
        parser.add_argument(
            "--company",
            type=str,
            default=None,
            help="Filtre une entreprise (username ou nom exact)",
        )
        parser.add_argument(
            "--seed",
            type=int,
            default=None,
            help="Seed RNG pour des titres reproductibles",
        )

    def handle(self, *args, **options):
        count: int = options["count"]
        company_filter: Optional[str] = options["company"]
        seed: Optional[int] = options["seed"]

        if count <= 0:
            raise CommandError("--count doit être un entier > 0")

        if seed is not None:
            random.seed(seed)

        companies = Company.objects.all()
        if company_filter:
            companies = companies.filter(
                Q(user__username=company_filter)
                | Q(name__iexact=company_filter)
                | Q(name__icontains=company_filter)
            )

        if not companies.exists():
            raise CommandError(
                "Aucune entreprise trouvée. Essayez sans --company ou vérifiez la valeur."
            )

        title_prefixes = [
            "Stage Développeur Frontend",
            "Stage Développeur Backend",
            "Stage Fullstack",
            "Stage Data Analyst",
            "Stage DevOps",
            "Stage UX/UI",
            "Stage QA",
        ]
        tech_keywords = [
            "React",
            "TypeScript",
            "Django",
            "Python",
            "Docker",
            "PostgreSQL",
            "AWS",
            "Kubernetes",
        ]
        locations = ["Lyon", "Villeurbanne", "Télétravail", "Hybride (Lyon)"]
        durations = ["4-6 mois", "6 mois", "3-4 mois", "12 mois (alternance)"]

        created_total = 0
        already_total = 0

        for company in companies:
            created_for_company = 0

            for _ in range(count):
                title = self._generate_unique_title(company, title_prefixes, tech_keywords)

                offer, created = InternshipOffer.objects.get_or_create(
                    company=company,
                    title=title,
                    defaults={
                        "description": "Offre générée automatiquement pour tests.",
                        "location": random.choice(locations),
                        "duration": random.choice(durations),
                        "requirements": "Profil motivé, bases solides et envie d'apprendre.",
                    },
                )

                if created:
                    created_total += 1
                    created_for_company += 1
                else:
                    already_total += 1

            company_label = (
                company.user.username
                if getattr(company, "user", None) is not None and company.user is not None
                else company.name
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ {created_for_company} offres créées pour {company_label}"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Terminé. Offres créées: {created_total} (déjà existantes: {already_total})."
            )
        )

    def _generate_unique_title(self, company, prefixes, techs) -> str:
        """Génère un titre d'offre peu probable à dupliquer."""

        # On limite les collisions en ajoutant un suffixe aléatoire.
        for _ in range(20):
            prefix = random.choice(prefixes)
            tech = random.choice(techs)
            suffix = random.randint(100, 999)
            title = f"{prefix} ({tech}) #{suffix}"
            if not InternshipOffer.objects.filter(company=company, title=title).exists():
                return title

        # Fallback si RNG malchanceux
        return f"Stage (Généré) #{random.randint(1000, 9999)}"
