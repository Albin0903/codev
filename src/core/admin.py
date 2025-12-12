from django.contrib import admin
from django.utils.html import format_html
from django import forms
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from django.contrib.auth.models import User
from django.urls import path
from django.http import HttpResponse, HttpResponseRedirect
from django.template.response import TemplateResponse
from django.core.management import call_command
from io import StringIO

from .models import Student, Skill, Company, Swipe, CompanySwipe, Match, Interview, InternshipOffer


class StudentForm(forms.ModelForm):
    skills = forms.ModelMultipleChoiceField(queryset=Skill.objects.all(), required=False)
    first_name = forms.CharField(max_length=150, required=False)
    last_name = forms.CharField(max_length=150, required=False)
    email = forms.EmailField(required=False)

    class Meta:
        model = Student
        fields = ['user', 'school', 'school_url', 'program', 'year', 'gender', 'preferences', 'availability', 'duration', 'education', 'experience', 'cv', 'skills']

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
    list_display = ['avatar_tag', 'user_link', 'program', 'year', 'school', 'gender', 'created_at']
    list_filter = ['program', 'year', 'gender']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name', 'school']
    raw_id_fields = ('user',)
    readonly_fields = ('created_at','updated_at')

    fieldsets = (
        (None, {
            'fields': ('user', 'first_name', 'last_name', 'email', 'school', 'school_url', 'program', 'year', 'gender', 'preferences', 'cv')
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


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'sector', 'contact_name', 'contact_email', 'created_at']
    list_filter = ['sector']
    search_fields = ['name', 'sector', 'contact_name', 'contact_email']


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
        ]
        return custom_urls + urls
    
    def reset_db_view(self, request):
        """Vue pour réinitialiser la base de données"""
        from django.contrib import messages
        if request.method == 'POST':
            try:
                # Appeler la commande reset_db avec --force
                output = StringIO()
                call_command('reset_db', '--force', stdout=output)
                result = output.getvalue()
                
                # Rediriger vers l'admin avec un message de succès
                messages.success(request, '✅ Base de données réinitialisée avec succès !')
                return HttpResponseRedirect('/admin/')
            except Exception as e:
                messages.error(request, f'❌ Erreur: {str(e)}')
                return HttpResponseRedirect('/admin/')
        
        # Afficher un formulaire de confirmation
        context = {
            'title': 'Réinitialiser la base de données',
            'opts': None,
            'has_view_permission': True,
        }
        return TemplateResponse(request, 'admin/reset_db.html', context)

# Utiliser le site admin personnalisé
admin.site.__class__ = CustomAdminSite

