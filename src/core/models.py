from django.db import models
from django.contrib.auth.models import User


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student')
    school = models.CharField(max_length=200, verbose_name="École", default="Polytech Lyon")
    school_url = models.URLField(blank=True, null=True, verbose_name="Site de l'école")
    program = models.CharField(max_length=200, verbose_name="Formation")
    year = models.CharField(max_length=50, blank=True, verbose_name="Année")
    role = models.CharField(max_length=100, blank=True, default='', verbose_name="Type de contrat")
    availability = models.CharField(max_length=100, blank=True, verbose_name="Disponibilité")
    duration = models.CharField(max_length=100, blank=True, verbose_name="Durée souhaitée")
    about = models.TextField(blank=True, verbose_name="À propos")
    education = models.JSONField(default=list, blank=True, verbose_name="Éducation")
    experience = models.JSONField(default=list, blank=True, verbose_name="Expérience")
    hobbies = models.JSONField(default=list, blank=True, verbose_name="Loisirs")
    theme = models.CharField(max_length=10, choices=[('light', 'Clair'), ('dark', 'Sombre')], default='dark', verbose_name="Thème")
    cv = models.FileField(upload_to='cvs/', blank=True, null=True, verbose_name="CV")
    # Liens sociaux
    linkedin_url = models.URLField(blank=True, null=True, verbose_name="Profil LinkedIn")
    github_url = models.URLField(blank=True, null=True, verbose_name="Profil GitHub")
    website_url = models.URLField(blank=True, null=True, verbose_name="Site personnel")
    # Infos additionnelles
    location = models.CharField(max_length=100, blank=True, verbose_name="Localisation")
    languages = models.JSONField(default=list, blank=True, verbose_name="Langues")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone")
    photo = models.ImageField(upload_to='photos/', blank=True, null=True, verbose_name="Photo de profil")
    photo_visible = models.BooleanField(default=True, verbose_name="Photo visible par les entreprises")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Étudiant"
        verbose_name_plural = "Étudiants"

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.program}"


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom")
    students = models.ManyToManyField(Student, related_name='skills', blank=True)

    class Meta:
        verbose_name = "Compétence"
        verbose_name_plural = "Compétences"

    def __str__(self):
        return self.name


class Company(models.Model):
    """Modèle représentant une entreprise"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company', null=True, blank=True)
    name = models.CharField(max_length=200, verbose_name="Nom")
    sector = models.CharField(max_length=200, verbose_name="Secteur")
    description = models.TextField(blank=True, verbose_name="Description")
    website = models.URLField(blank=True, verbose_name="Site web")
    logo = models.ImageField(upload_to='logos/', blank=True, null=True, verbose_name="Logo")
    contact_email = models.EmailField(verbose_name="Email de contact")
    contact_name = models.CharField(max_length=200, verbose_name="Nom du contact")
    # Infos supplémentaires pour le profil entreprise
    address = models.CharField(max_length=255, blank=True, verbose_name="Adresse")
    employees = models.IntegerField(null=True, blank=True, verbose_name="Nombre d'employés")
    founded_year = models.IntegerField(null=True, blank=True, verbose_name="Année de création")
    benefits = models.TextField(blank=True, verbose_name="Avantages proposés")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Entreprise"
        verbose_name_plural = "Entreprises"

    def __str__(self):
        return self.name


class InternshipOffer(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='offers')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    duration = models.CharField(max_length=100, blank=True)
    requirements = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Offre de stage"
        verbose_name_plural = "Offres de stage"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.company.name}"


class MatchScore(models.Model):
    """Score de matching pré-calculé entre un étudiant et une offre.
    
    Évite de recalculer l'IA sémantique à chaque swipe.
    Les scores sont recalculés via l'endpoint admin /api/compute-scores/.
    """
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='match_scores')
    offer = models.ForeignKey('InternshipOffer', on_delete=models.CASCADE, related_name='match_scores')
    score = models.IntegerField(default=0, verbose_name="Score (0-100)")
    computed_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Score de matching"
        verbose_name_plural = "Scores de matching"
        unique_together = ['student', 'offer']
        ordering = ['-score']

    def __str__(self):
        return f"{self.student} ↔ {self.offer.title}: {self.score}/100"


class Swipe(models.Model):
    DIRECTION_CHOICES = [
        ('right', 'Intéressé'),
        ('left', 'Pas intéressé'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='swipes')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='student_swipes')
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Swipe Étudiant"
        verbose_name_plural = "Swipes Étudiants"
        unique_together = ['student', 'company']  # Un étudiant ne peut swiper qu'une fois par entreprise

    def __str__(self):
        return f"{self.student.user.username} -> {self.company.name} ({self.direction})"


class CompanySwipe(models.Model):
    DIRECTION_CHOICES = [
        ('right', 'Intéressé'),
        ('left', 'Pas intéressé'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='swipes')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='company_swipes')
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Swipe Entreprise"
        verbose_name_plural = "Swipes Entreprises"
        unique_together = ['company', 'student']  # Une entreprise ne peut swiper qu'une fois par étudiant

    def __str__(self):
        return f"{self.company.name} -> {self.student.user.username} ({self.direction})"


class Match(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='matches')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='matches')
    is_mutual = models.BooleanField(default=False, verbose_name="Match mutuel")
    created_at = models.DateTimeField(auto_now_add=True)
    student_priority = models.PositiveIntegerField(default=0, verbose_name="Priorité étudiant")

    class Meta:
        verbose_name = "Match"
        verbose_name_plural = "Matchs"
        unique_together = ['student', 'company']
        ordering = ['student_priority']

    def __str__(self):
        status = "✓ Mutuel" if self.is_mutual else "En attente"
        return f"{self.student.user.username} ↔ {self.company.name} ({status})"
    
    def check_mutual(self):
        """Vérifie si le match est mutuel (les deux ont swiped right)"""
        student_liked = Swipe.objects.filter(
            student=self.student, 
            company=self.company, 
            direction='right'
        ).exists()
        
        company_liked = CompanySwipe.objects.filter(
            company=self.company, 
            student=self.student, 
            direction='right'
        ).exists()
        
        self.is_mutual = student_liked and company_liked
        return self.is_mutual


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


class Forum(models.Model):
    """Modèle représentant un forum de recrutement"""
    name = models.CharField(max_length=200, verbose_name="Nom du forum")
    date = models.DateField(verbose_name="Date du forum")
    start_time = models.TimeField(verbose_name="Heure de début", default="09:00")
    end_time = models.TimeField(verbose_name="Heure de fin", default="17:00")
    location = models.CharField(max_length=255, verbose_name="Lieu")
    address = models.TextField(blank=True, verbose_name="Adresse complète")
    description = models.TextField(blank=True, verbose_name="Description")
    is_active = models.BooleanField(default=True, verbose_name="Forum actif")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Forum"
        verbose_name_plural = "Forums"
        ordering = ['-date']

    def __str__(self):
        return f"{self.name} - {self.date}"
