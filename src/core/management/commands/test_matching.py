import logging

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from core.models import Company, InternshipOffer, Match, Skill, Student
from core.services import simple_match


class Command(BaseCommand):
    help = "Génère des données de test et teste le système de matching (sans effacer les données de démo)."

    def handle(self, *args, **kwargs):
        logging.basicConfig(level=logging.INFO)

        # Nettoyage ciblé (uniquement les objets créés par cette commande)
        test_usernames = ["tm_alice", "tm_bob", "tm_techcorp", "tm_devinc"]
        test_company_names = ["TM TechCorp", "TM DevInc"]

        Match.objects.filter(
            student__user__username__in=test_usernames
        ).delete()
        InternshipOffer.objects.filter(company__name__in=test_company_names).delete()
        Company.objects.filter(name__in=test_company_names).delete()
        Student.objects.filter(user__username__in=test_usernames).delete()
        User.objects.filter(username__in=test_usernames).delete()

        # Étudiants de test
        alice = User.objects.create_user(username="tm_alice", password="test123", first_name="Alice", last_name="Test")
        bob = User.objects.create_user(username="tm_bob", password="test123", first_name="Bob", last_name="Test")

        s1 = Student.objects.create(user=alice, location="Paris", program="Informatique")
        s2 = Student.objects.create(user=bob, location="Lyon", program="Développement")

        python_skill, _ = Skill.objects.get_or_create(name="Python")
        java_skill, _ = Skill.objects.get_or_create(name="Java")
        react_skill, _ = Skill.objects.get_or_create(name="React")
        s1.skills.add(python_skill, react_skill)
        s2.skills.add(java_skill)

        # Entreprises + offres de test
        tech_user = User.objects.create_user(username="tm_techcorp", password="test123")
        dev_user = User.objects.create_user(username="tm_devinc", password="test123")

        c1 = Company.objects.create(
            user=tech_user,
            name="TM TechCorp",
            sector="IT",
            address="Paris",
            contact_email="contact@tm-techcorp.com",
            contact_name="Mr Tech",
        )
        c2 = Company.objects.create(
            user=dev_user,
            name="TM DevInc",
            sector="IT",
            address="Lyon",
            contact_email="contact@tm-devinc.com",
            contact_name="Mme Dev",
        )

        InternshipOffer.objects.create(
            company=c1,
            title="Stage Backend Python",
            requirements="Python, Django, PostgreSQL",
            location="Paris",
            duration="6 mois",
            description="API Django pour une plateforme SaaS",
        )
        InternshipOffer.objects.create(
            company=c2,
            title="Stage Java",
            requirements="Java, Spring",
            location="Lyon",
            duration="4-6 mois",
            description="Microservices et CI/CD",
        )

        # Calcul du score et création des matches (non-mutuel : c'est un test d'algorithme)
        for student in Student.objects.filter(user__username__in=["tm_alice", "tm_bob"]).select_related("user"):
            matches = simple_match(student, Company.objects.filter(name__in=test_company_names))
            for company, score in matches:
                Match.objects.get_or_create(student=student, company=company)
                logging.info(
                    f"MatchScore: {student.user.username} -> {company.name} | score={score}"
                )

        self.stdout.write(self.style.SUCCESS("Test de matching terminé. Vérifiez les logs."))