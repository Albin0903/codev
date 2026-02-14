from django.contrib import admin
from django.utils.html import format_html
from django import forms
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from django.contrib.auth.models import User
from django.urls import path
from django.http import HttpResponse, HttpResponseRedirect
from django.template.response import TemplateResponse
from django.core.management import call_command
from django.shortcuts import render, redirect
from django.db import transaction
from django.contrib import messages
from django.utils.text import slugify
from django.utils.crypto import get_random_string
from io import StringIO
import pandas as pd

from .models import Student, Skill, Company, Swipe, CompanySwipe, Match, Interview, InternshipOffer


class StudentForm(forms.ModelForm):
    skills = forms.ModelMultipleChoiceField(queryset=Skill.objects.all(), required=False)
    first_name = forms.CharField(max_length=150, required=False)
    last_name = forms.CharField(max_length=150, required=False)
    email = forms.EmailField(required=False)

    class Meta:
        model = Student
        fields = ['user', 'school', 'school_url', 'program', 'year', 'role', 'about', 'availability', 'duration', 'education', 'experience', 'cv', 'skills']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields['skills'].initial = self.instance.skills.all()
            # populate user fields
            self.fields['first_name'].initial = self.instance.user.first_name
            self.fields['last_name'].initial = self.instance.user.last_name
            self.fields['email'].initial = self.instance.user.email
            # populate school_url
            try:
                self.fields['school_url'].initial = self.instance.school_url
            except Exception:
                pass
            # populate new profile fields
            try:
                self.fields['availability'].initial = self.instance.availability
                self.fields['duration'].initial = self.instance.duration
                self.fields['education'].initial = self.instance.education
                self.fields['experience'].initial = self.instance.experience
            except Exception:
                pass

    def save(self, commit=True):
        inst = super().save(commit=False)
        if commit:
            inst.save()
            self.save_m2m()
            # set skills relation (Skill.students many-to-many)
            selected = self.cleaned_data.get('skills') or []
            # clear existing
            for skill in Skill.objects.all():
                skill.students.remove(inst)
            for skill in selected:
                skill.students.add(inst)
            # update linked User fields
            user = inst.user
            user.first_name = self.cleaned_data.get('first_name', '')
            user.last_name = self.cleaned_data.get('last_name', '')
            user.email = self.cleaned_data.get('email', '')
            # update school_url and new profile fields on Student instance
            inst.school_url = self.cleaned_data.get('school_url', '')
            inst.availability = self.cleaned_data.get('availability', '')
            inst.duration = self.cleaned_data.get('duration', '')
            inst.education = self.cleaned_data.get('education', '')
            inst.experience = self.cleaned_data.get('experience', '')
            inst.save()
            user.save()
        return inst


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    form = StudentForm
    list_display = ['avatar_tag', 'user_link', 'program', 'year', 'school', 'role', 'created_at']
    list_filter = ['program', 'year', 'role']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name', 'school']
    raw_id_fields = ('user',)
    readonly_fields = ('created_at','updated_at')

    fieldsets = (
        (None, {
            'fields': ('user', 'first_name', 'last_name', 'email', 'school', 'school_url', 'program', 'year', 'role', 'about', 'cv')
        }),
        ('Timestamps', {
            'fields': ('created_at','updated_at'),
            'classes': ('collapse',)
        }),
    )

    def avatar_tag(self, obj):
        # Try common places for an avatar image and render a small preview
        url = None
        # If Student has a photo/image field
        try:
            if hasattr(obj, 'photo') and obj.photo:
                url = obj.photo.url
        except Exception:
            url = None
        # Fallback: maybe the related User has a profile with photo
        if not url and getattr(obj.user, 'profile', None):
            try:
                if hasattr(obj.user.profile, 'photo') and obj.user.profile.photo:
                    url = obj.user.profile.photo.url
            except Exception:
                url = None
        if not url:
            return ""
        return format_html('<img src="{}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" />', url)
    avatar_tag.short_description = "Avatar"

    def user_link(self, obj):
        if obj.user:
            url = f"/admin/auth/user/{obj.user.id}/change/"
            return format_html('<a href="{}">{}</a>', url, obj.user.get_full_name() or obj.user.username) # type: ignore
        return "-"
    user_link.short_description = "User"


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


class ExcelImportForm(forms.Form):
    # On autorise Excel et CSV dans le libellé
    excel_file = forms.FileField(label="Fichier source (.xlsx ou .csv)")


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    change_list_template = "admin/company_change_list.html"
    list_display = ['name', 'sector', 'contact_name', 'contact_email', 'created_at']
    list_filter = ['sector']
    search_fields = ['name', 'sector', 'contact_name', 'contact_email']
    
    # 2. Ajouter l'URL personnalisée pour l'import
    def get_urls(self):
        urls = super().get_urls()
        new_urls = [
            path('import-excel/', self.admin_site.admin_view(self.import_excel), name='company_import_excel'),
        ]
        return new_urls + urls

    # 3. La vue qui gère l'importation
    def import_excel(self, request):
        if request.method == "POST":
            form = ExcelImportForm(request.POST, request.FILES)
            if form.is_valid():
                file = request.FILES["excel_file"]
                filename = file.name.lower()
                
                try:
                    # --- DÉTECTION DU FORMAT ---
                    if filename.endswith('.csv'):
                        try:
                            df = pd.read_csv(file)
                            if len(df.columns) < 2: 
                                file.seek(0)
                                df = pd.read_csv(file, sep=';')
                        except Exception:
                            file.seek(0)
                            df = pd.read_csv(file, sep=';', encoding='latin-1')
                    else:
                        df = pd.read_excel(file)

                    # --- NETTOYAGE ---
                    df.columns = df.columns.str.strip()
                    
                    # On a seulement besoin de l'email et du nom maintenant
                    required_columns = ['email', 'nom_entreprise']
                    if not all(col in df.columns for col in required_columns):
                        missing = [c for c in required_columns if c not in df.columns]
                        messages.error(request, f"Colonnes manquantes : {', '.join(missing)}")
                        return redirect("..")

                    results = [] # Pour stocker les identifiants générés

                    with transaction.atomic():
                        for index, row in df.iterrows():
                            email = str(row['email']).strip()
                            nom_entreprise = str(row.get('nom_entreprise', 'Entreprise')).strip()
                            
                            if not email or email.lower() in ['nan', 'none', '']:
                                continue 

                            # --- GÉNÉRATION AUTOMATIQUE DES CREDENTIALS ---
                            generated_pass = None
                            is_new_account = False
                            
                            # 1. Génération du Username (ex: "Tech Corp" -> "tech_corp")
                            base_username = slugify(nom_entreprise).replace('-', '_')
                            username = base_username
                            counter = 1
                            # Si le username existe déjà, on ajoute un chiffre (tech_corp_1, tech_corp_2...)
                            while User.objects.filter(username=username).exclude(email=email).exists():
                                username = f"{base_username}_{counter}"
                                counter += 1

                            # 2. Gestion du User
                            user = User.objects.filter(email=email).first()
                            
                            if not user:
                                # C'est un nouveau compte : on génère un mot de passe
                                generated_pass = get_random_string(length=10) # Mot de passe aléatoire
                                user = User.objects.create_user(
                                    username=username,
                                    email=email,
                                    password=generated_pass,
                                    first_name=nom_entreprise,
                                )
                                is_new_account = True
                            else:
                                # Le compte existe déjà
                                username = user.username # On garde l'ancien username
                                generated_pass = "(Inchangé)"

                            # 3. Gestion Entreprise
                            company, created = Company.objects.get_or_create(
                                user=user,
                                defaults={
                                    'name': nom_entreprise,
                                    'sector': row.get('secteur', 'Non spécifié'),
                                    'description': row.get('description_entreprise', ''),
                                    'contact_email': email,
                                    'contact_name': row.get('contact_name', 'RH'),
                                }
                            )

                            # 4. Gestion Offre
                            titre_raw = row.get('titre_offre')
                            has_offer = pd.notna(titre_raw) and str(titre_raw).strip() not in ['', 'nan', 'None']
                            if has_offer:
                                if not InternshipOffer.objects.filter(company=company, title=str(titre_raw).strip()).exists():
                                    InternshipOffer.objects.create(
                                        company=company,
                                        title=str(titre_raw).strip(),
                                        description=row.get('description_offre', 'Voir détails'),
                                        location=row.get('lieu', ''),
                                        duration=row.get('duree', ''),
                                        requirements=row.get('competences', '')
                                    )

                            # 5. Ajout au rapport de résultat
                            results.append({
                                'company': nom_entreprise,
                                'username': username,
                                'password': generated_pass,
                                'email': email,
                                'status': 'Nouveau' if is_new_account else 'Existant'
                            })

                    # Au lieu de rediriger, on affiche la page de résultats
                    context = {
                        'results': results,
                        'title': 'Rapport d\'importation',
                        'site_header': self.admin_site.site_header,
                        'site_title': self.admin_site.site_title,
                        'has_permission': True,
                    }
                    return render(request, "admin/import_results.html", context)

                except Exception as e:
                    messages.error(request, f"Erreur : {str(e)}")
                    return redirect("..")
        else:
            form = ExcelImportForm()

        context = {
            'form': form,
            'title': 'Importer Entreprises',
            'site_header': self.admin_site.site_header,
            'site_title': self.admin_site.site_title,
            'has_permission': True,
        }
        return render(request, "admin/import_excel.html", context)
    
@admin.register(Swipe)
class SwipeAdmin(admin.ModelAdmin):
    list_display = ['student', 'company', 'direction', 'created_at']
    list_filter = ['direction', 'created_at']
    search_fields = ['student__user__username', 'company__name']


@admin.register(CompanySwipe)
class CompanySwipeAdmin(admin.ModelAdmin):
    list_display = ['company', 'student', 'direction', 'created_at']
    list_filter = ['direction', 'created_at']
    search_fields = ['company__name', 'student__user__username']


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['student', 'company', 'is_mutual', 'created_at']
    list_filter = ['is_mutual', 'created_at']
    search_fields = ['student__user__username', 'company__name']


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ['student', 'company', 'time_slot', 'duration', 'room', 'status']
    list_filter = ['status', 'time_slot']
    search_fields = ['match__student__user__username', 'match__company__name', 'room']
    
    def student(self, obj):
        return obj.match.student
    
    def company(self, obj):
        return obj.match.company


# Add Student inline on User admin so you can edit Student when editing User
class StudentInline(admin.StackedInline):
    model = Student
    can_delete = False
    verbose_name_plural = 'Étudiant'
    fk_name = 'user'


# unregister and re-register User admin to include the Student inline
admin.site.unregister(User)


@admin.register(User)
class CustomUserAdmin(DefaultUserAdmin):
    inlines = (StudentInline,)
    # keep the existing behavior of DefaultUserAdmin


@admin.register(InternshipOffer)
class InternshipOfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'duration', 'created_at']
    list_filter = ['company', 'created_at']
    search_fields = ['title', 'company__name', 'location', 'description']
    raw_id_fields = ('company',)


# Site admin personnalisé avec option de reset
class CustomAdminSite(admin.AdminSite):
    site_header = "JobFair Admin"
    site_title = "JobFair"
    index_title = "Bienvenue"
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('reset-db/', self.admin_view(self.reset_db_view), name='reset-db'),
            # Nouvelles routes pour l'organisation
            path('close-swipes/', self.admin_view(self.close_swipes_view), name='close-swipes'),
            path('generate-plannings/', self.admin_view(self.generate_plannings_view), name='generate-plannings'),
        ]
        return custom_urls + urls
    
    def close_swipes_view(self, request):
        """Désactive la possibilité de swiper pour tout le monde"""
        # Option 1: Utiliser le cache pour stocker l'état
        from django.core.cache import cache
        cache.set('swipes_enabled', False, None) # None = permanent
        
        messages.success(request, '🚫 La phase de Swipes est désormais FERMÉE.')
        return HttpResponseRedirect('/admin/')

    def generate_plannings_view(self, request):
        """Lance l'algorithme de matching biparti et anti-stress"""
        from .services import run_global_smart_matching
        try:
            result = run_global_smart_matching()
            if "error" in result:
                messages.error(request, f"❌ Erreur : {result['error']}")
            else:
                messages.success(request, f"✅ Planning généré avec succès ({result['slots_count']} créneaux optimisés).")
        except Exception as e:
            messages.error(request, f"❌ Erreur critique : {str(e)}")
            
        return HttpResponseRedirect('/admin/')

# Utiliser le site admin personnalisé
admin.site.__class__ = CustomAdminSite

