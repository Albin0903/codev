from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Student, Skill, Company, Swipe, Match, Interview, InternshipOffer, CompanySwipe


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    user_type = serializers.ChoiceField(choices=['student', 'company'])

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà utilisé.")
        return value


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    cv_url = serializers.SerializerMethodField()
    cv_name = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'school', 'school_url', 'program', 'year', 'role', 'availability', 'duration', 'about', 'education', 'experience', 'hobbies', 'theme', 'cv', 'cv_url', 'cv_name', 'linkedin_url', 'github_url', 'website_url', 'location', 'languages', 'phone', 'photo', 'photo_url', 'photo_visible', 'skills', 'created_at']
    
    def get_cv_url(self, obj):
        """Retourne l'URL absolue du CV si présent"""
        if obj.cv:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cv.url)
            return obj.cv.url
        return None
    
    def get_cv_name(self, obj):
        """Retourne le nom du fichier CV"""
        if obj.cv:
            return obj.cv.name.split('/')[-1]
        return None
    
    def get_photo_url(self, obj):
        """Retourne l'URL absolue de la photo si présente et visible"""
        if not obj.photo:
            return None

        request = self.context.get('request') if hasattr(self, 'context') else None

        # Le propriétaire voit toujours sa photo, même masquée aux recruteurs
        if request and getattr(request, 'user', None) == obj.user:
            return request.build_absolute_uri(obj.photo.url)

        # Les autres ne voient la photo que si elle est marquée comme visible
        if obj.photo_visible:
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None


class InternshipOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipOffer
        fields = ['id', 'title', 'description', 'location', 'duration', 'requirements', 'created_at']


class CompanySerializer(serializers.ModelSerializer):
    offers = InternshipOfferSerializer(many=True, read_only=True)
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'sector', 'description', 'website', 'logo', 'logo_url',
            'contact_email', 'contact_name', 'address', 'employees', 'founded_year', 'benefits',
            'created_at', 'offers'
        ]

    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request') if hasattr(self, 'context') else None
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None


class SwipeSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Swipe
        fields = ['id', 'company', 'company_id', 'direction', 'created_at']
        read_only_fields = ['created_at']


class CompanySwipeSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = CompanySwipe
        fields = ['id', 'student', 'student_id', 'direction', 'created_at']
        read_only_fields = ['created_at']


class MatchSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    student = StudentSerializer(read_only=True)
    
    class Meta:
        model = Match
        fields = ['id', 'student', 'company', 'is_mutual', 'created_at']


class InterviewSerializer(serializers.ModelSerializer):
    match = MatchSerializer(read_only=True)
    company = serializers.SerializerMethodField()
    
    class Meta:
        model = Interview
        fields = [
            'id', 'match', 'company', 'time_slot', 'duration', 
            'room', 'status', 'notes', 'created_at'
        ]
    
    def get_company(self, obj):
        return CompanySerializer(obj.match.company, context=self.context).data
