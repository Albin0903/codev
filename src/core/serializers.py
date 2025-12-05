from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Student, Skill, Company, Swipe, Match, Interview


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    cv_url = serializers.SerializerMethodField()
    cv_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'school', 'school_url', 'program', 'year', 'gender', 'preferences', 'availability', 'duration', 'education', 'experience', 'hobbies', 'theme', 'cv', 'cv_url', 'cv_name', 'linkedin_url', 'github_url', 'website_url', 'location', 'languages', 'phone', 'skills', 'created_at']
    
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


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'sector', 'description', 'website', 
            'logo', 'contact_email', 'contact_name', 'created_at'
        ]


class SwipeSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Swipe
        fields = ['id', 'company', 'company_id', 'direction', 'created_at']
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
        return CompanySerializer(obj.match.company).data
