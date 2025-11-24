from django.db import models
from django.contrib.auth.models import User


class Student(models.Model):
    """Modèle représentant un étudiant"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student')
    school = models.CharField(max_length=200, verbose_name="École", default="Polytech Lyon")
    school_url = models.URLField(blank=True, null=True, verbose_name="Site de l'école")
    program = models.CharField(max_length=200, verbose_name="Formation")
    year = models.CharField(max_length=50, verbose_name="Année")
    gender = models.CharField(max_length=1, choices=[('M', 'Homme'), ('F', 'Femme'), ('O', 'Autre')], default='O', verbose_name="Genre")
    preferences = models.TextField(blank=True, verbose_name="Préférences")
    availability = models.CharField(max_length=100, blank=True, verbose_name="Disponibilité")
    duration = models.CharField(max_length=100, blank=True, verbose_name="Durée souhaitée")
    education = models.TextField(blank=True, verbose_name="Éducation")
    experience = models.TextField(blank=True, verbose_name="Expérience")
    hobbies = models.TextField(blank=True, verbose_name="Loisirs")
    theme = models.CharField(max_length=10, choices=[('light', 'Clair'), ('dark', 'Sombre')], default='dark', verbose_name="Thème")
    cv = models.FileField(upload_to='cvs/', blank=True, null=True, verbose_name="CV")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Étudiant"
        verbose_name_plural = "Étudiants"

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.program}"


class Skill(models.Model):
    """Modèle représentant une compétence"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom")
    students = models.ManyToManyField(Student, related_name='skills', blank=True)

    class Meta:
        verbose_name = "Compétence"
        verbose_name_plural = "Compétences"

    def __str__(self):
        return self.name


class Company(models.Model):
    """Modèle représentant une entreprise"""
    name = models.CharField(max_length=200, verbose_name="Nom")
    sector = models.CharField(max_length=200, verbose_name="Secteur")
    description = models.TextField(blank=True, verbose_name="Description")
    website = models.URLField(blank=True, verbose_name="Site web")
    logo = models.ImageField(upload_to='logos/', blank=True, null=True, verbose_name="Logo")
    contact_email = models.EmailField(verbose_name="Email de contact")
    contact_name = models.CharField(max_length=200, verbose_name="Nom du contact")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Entreprise"
        verbose_name_plural = "Entreprises"

    def __str__(self):
        return self.name


class Swipe(models.Model):
    """Modèle représentant un swipe (like/dislike)"""
    DIRECTION_CHOICES = [
        ('right', 'Intéressé'),
        ('left', 'Pas intéressé'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='swipes')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='swipes')
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Swipe"
        verbose_name_plural = "Swipes"
        unique_together = ['student', 'company']  # Un étudiant ne peut swiper qu'une fois par entreprise

    def __str__(self):
        return f"{self.student.user.username} -> {self.company.name} ({self.direction})"


class Match(models.Model):
    """Modèle représentant un match mutuel entre étudiant et entreprise"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='matches')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='matches')
    is_mutual = models.BooleanField(default=False, verbose_name="Match mutuel")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Match"
        verbose_name_plural = "Matchs"
        unique_together = ['student', 'company']

    def __str__(self):
        status = "✓ Mutuel" if self.is_mutual else "En attente"
        return f"{self.student.user.username} ↔ {self.company.name} ({status})"


class Interview(models.Model):
    """Modèle représentant un entretien planifié"""
    match = models.OneToOneField(Match, on_delete=models.CASCADE, related_name='interview')
    time_slot = models.DateTimeField(verbose_name="Créneau horaire")
    duration = models.IntegerField(default=20, verbose_name="Durée (minutes)")
    room = models.CharField(max_length=100, blank=True, verbose_name="Salle")
    status = models.CharField(
        max_length=20,
        choices=[
            ('scheduled', 'Planifié'),
            ('confirmed', 'Confirmé'),
            ('completed', 'Terminé'),
            ('cancelled', 'Annulé'),
        ],
        default='scheduled',
        verbose_name="Statut"
    )
    notes = models.TextField(blank=True, verbose_name="Notes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Entretien"
        verbose_name_plural = "Entretiens"
        ordering = ['time_slot']

    def __str__(self):
        return f"{self.match.student.user.username} - {self.match.company.name} le {self.time_slot}"

    @property
    def company(self):
        return self.match.company

    @property
    def student(self):
        return self.match.student
