from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
from django.utils import timezone
from datetime import timedelta
import random

from .models import Student, Company, Swipe, CompanySwipe, Match, Interview
from .serializers import (
    StudentSerializer, CompanySerializer, SwipeSerializer, 
    MatchSerializer, InterviewSerializer
)
from .permissions import IsStudent, IsCompany, CanOnlyModifyOwnData


def create_interview_for_match(match):
    """Créer automatiquement un entretien pour un match mutuel.
    
    Génère un créneau horaire aléatoire dans les prochaines heures du forum.
    """
    # Vérifier si un interview existe déjà pour ce match
    if hasattr(match, 'interview'):
        return match.interview
    
    # Générer un créneau horaire (aujourd'hui ou demain, entre 9h et 17h)
    now = timezone.now()
    # Arrondir à l'heure suivante
    base_time = now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
    
    # Ajouter un délai aléatoire entre 1h et 6h
    random_hours = random.randint(1, 6)
    interview_time = base_time + timedelta(hours=random_hours)
    
    # S'assurer que c'est pendant les heures ouvrées (9h-17h)
    if interview_time.hour < 9:
        interview_time = interview_time.replace(hour=9)
    elif interview_time.hour >= 17:
        # Passer au lendemain 9h
        interview_time = interview_time.replace(hour=9) + timedelta(days=1)
    
    # Créer l'interview
    rooms = ['Salle A01', 'Salle A02', 'Salle B01', 'Salle B02', 'Stand Principal']
    interview = Interview.objects.create(
        match=match,
        time_slot=interview_time,
        duration=20,
        room=random.choice(rooms),
        status='scheduled'
    )
    
    return interview


class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint pour consulter les entreprises
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def next_card(self, request):
        """Retourne la prochaine entreprise à swiper"""
        try:
            student = request.user.student
            # Récupérer les entreprises non encore swipées
            swiped_companies = Swipe.objects.filter(student=student).values_list('company_id', flat=True)
            company = Company.objects.exclude(id__in=swiped_companies).first()
            
            if company:
                serializer = self.get_serializer(company, context={'request': request})
                return Response(serializer.data)
            else:
                return Response({'detail': 'No more companies'}, status=status.HTTP_204_NO_CONTENT)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_400_BAD_REQUEST)


class SwipeViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour gérer les swipes.
    Un étudiant ne peut créer que SES propres swipes.
    """
    serializer_class = SwipeSerializer
    permission_classes = [IsAuthenticated, IsStudent, CanOnlyModifyOwnData]
    
    def get_queryset(self):
        """Retourner uniquement les swipes de l'utilisateur connecté"""
        try:
            return Swipe.objects.filter(student=self.request.user.student)
        except Student.DoesNotExist:
            return Swipe.objects.none()
    
    def create(self, request):
        """Créer un nouveau swipe - seulement pour l'utilisateur connecté"""
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        company_id = request.data.get('company_id')
        direction = request.data.get('direction')
        
        if not company_id or not direction:
            return Response(
                {'error': 'company_id and direction are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validation: direction doit être 'left' ou 'right'
        if direction not in ['left', 'right']:
            return Response(
                {'error': 'direction must be "left" or "right"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        company = get_object_or_404(Company, id=company_id)
        
        # Créer le swipe (un par student/company)
        swipe, created = Swipe.objects.get_or_create(
            student=student,
            company=company,
            defaults={'direction': direction}
        )
        
        # Vérifier s'il y a match mutuel
        match_created = False
        is_mutual = False
        
        if direction == 'right':
            # Vérifier si l'entreprise a aussi liké cet étudiant
            company_liked = CompanySwipe.objects.filter(
                company=company,
                student=student,
                direction='right'
            ).exists()
            
            if company_liked:
                # Match mutuel !
                match, match_created = Match.objects.get_or_create(
                    student=student,
                    company=company,
                    defaults={'is_mutual': True}
                )
                if not match_created and not match.is_mutual:
                    match.is_mutual = True
                    match.save()
                is_mutual = True
                
                # Créer automatiquement un entretien
                create_interview_for_match(match)
        
        serializer = self.get_serializer(swipe)
        return Response({
            'swipe': serializer.data,
            'match': match_created or is_mutual,
            'created': created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class MatchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint pour consulter les matchs
    """
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        try:
            return Match.objects.filter(
                student=self.request.user.student,
                is_mutual=True
            ).select_related('company', 'student__user').order_by('-created_at')
        except Student.DoesNotExist:
            return Match.objects.none()


class InterviewViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint pour consulter les entretiens
    """
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        try:
            return Interview.objects.filter(
                match__student=self.request.user.student
            ).select_related('match__company', 'match__student__user').order_by('time_slot')
        except Student.DoesNotExist:
            return Interview.objects.none()


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """GET: Retourne les informations de l'utilisateur connecté
       PATCH: Met à jour des champs du profil étudiant (ex: school_url)
    """
    try:
        student = request.user.student
    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StudentSerializer(student, context={'request': request})
        return Response(serializer.data)

    # PATCH
    # Allow updating some user fields (first_name, last_name, email) alongside Student
    data = request.data.copy() if isinstance(request.data, dict) else dict(request.data)
    user_updated = False
    user = request.user
    for key in ('first_name', 'last_name', 'email'):
        if key in data:
            try:
                setattr(user, key, data.pop(key))
                user_updated = True
            except Exception:
                pass
    if user_updated:
        user.save()

    # handle skills specially if provided (accept array of names or ids)
    skills_payload = None
    if 'skills' in data:
        skills_payload = data.pop('skills')

    serializer = StudentSerializer(student, data=data, partial=True)
    if serializer.is_valid():
        inst = serializer.save()

        # update skills relation if provided
        if skills_payload is not None:
            try:
                # accept comma-separated string, array of strings, or array of ids
                names = []
                if isinstance(skills_payload, str):
                    names = [s.trim() for s in skills_payload.split(',') if s.strip()]
                elif isinstance(skills_payload, list):
                    # determine if list of ints (ids) or strings (names)
                    if len(skills_payload) > 0 and isinstance(skills_payload[0], int):
                        from django.shortcuts import get_object_or_404
                        skills_objs = []
                        for sid in skills_payload:
                            try:
                                skills_objs.append(Skill.objects.get(id=sid))
                            except Exception:
                                continue
                        inst.skills.set(skills_objs)
                    else:
                        # list of names
                        names = [str(s).strip() for s in skills_payload if str(s).strip()]
                if names:
                    skills_objs = []
                    for nm in names:
                        sk, _ = Skill.objects.get_or_create(name=nm)
                        skills_objs.append(sk)
                    inst.skills.set(skills_objs)
            except Exception:
                pass

        # re-serialize to include fresh related user and skills data
        return Response(StudentSerializer(inst, context={'request': request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@csrf_exempt
def login_view(request):
    """Endpoint de connexion - détecte automatiquement le type d'utilisateur"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        # create or get token
        token, _ = Token.objects.get_or_create(user=user)
        
        # Détecter le type d'utilisateur
        user_type = None
        profile_data = {}
        
        # Vérifier si c'est une entreprise
        try:
            company = user.company
            from .serializers import CompanySerializer
            serializer = CompanySerializer(company, context={'request': request})
            profile_data = serializer.data
            user_type = 'company'
        except Company.DoesNotExist:
            pass
        
        # Sinon, c'est un étudiant (ou on en crée un)
        if user_type is None:
            student, created = Student.objects.get_or_create(
                user=user,
                defaults={
                    'program': 'Non spécifié',
                    'year': 'N/A',
                    'preferences': 'Profil généré automatiquement'
                }
            )
            from .serializers import StudentSerializer
            serializer = StudentSerializer(student, context={'request': request})
            profile_data = serializer.data
            user_type = 'student'
        
        # Retourner les infos avec le type d'utilisateur
        response_data = profile_data
        response_data['token'] = token.key
        response_data['user_type'] = user_type  # 'student' ou 'company'
        
        return Response(response_data)
    else:
        return Response(
            {'error': 'Identifiants invalides'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Endpoint de déconnexion - supprime le token"""
    try:
        # Supprimer le token de l'utilisateur
        request.user.auth_token.delete()
    except Exception:
        pass
    
    logout(request)
    return Response({'message': 'Successfully logged out'})


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def upload_cv(request):
    """POST: Upload un CV (fichier PDF)
       DELETE: Supprime le CV existant
    """
    try:
        student = request.user.student
    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        if student.cv:
            # Supprimer le fichier physique
            student.cv.delete(save=True)
            return Response({'message': 'CV supprimé avec succès'})
        return Response({'error': 'Aucun CV à supprimer'}, status=status.HTTP_404_NOT_FOUND)

    # POST - Upload
    if 'cv' not in request.FILES:
        return Response({'error': 'Aucun fichier fourni'}, status=status.HTTP_400_BAD_REQUEST)
    
    cv_file = request.FILES['cv']
    
    # Validation du type de fichier
    allowed_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if cv_file.content_type not in allowed_types:
        return Response(
            {'error': 'Format non supporté. Utilisez PDF ou Word (.doc, .docx)'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validation de la taille (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    if cv_file.size > max_size:
        return Response(
            {'error': 'Fichier trop volumineux. Maximum 5MB.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Parser le CV pour extraire les informations
    extracted_data = {}
    try:
        from .cv_parser import parse_cv
        extracted_data = parse_cv(cv_file, cv_file.content_type)
        cv_file.seek(0)  # Reset file pointer après parsing
    except Exception as e:
        print(f"Erreur parsing CV: {e}")
        # Continue même si le parsing échoue
    
    # Supprimer l'ancien CV s'il existe
    if student.cv:
        student.cv.delete(save=False)
    
    # Sauvegarder le nouveau CV (sans appliquer automatiquement les données extraites)
    # L'utilisateur choisira s'il veut appliquer les données via la modal d'import
    student.cv = cv_file
    student.save()
    
    # Retourner les infos mises à jour avec les données extraites
    from .serializers import StudentSerializer
    serializer = StudentSerializer(student, context={'request': request})
    response_data = serializer.data
    response_data['extracted_from_cv'] = extracted_data  # Inclure les données extraites pour la modal
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['POST', 'DELETE', 'PATCH'])
@permission_classes([IsAuthenticated, IsStudent])
def upload_photo(request):
    """POST: Upload une photo de profil
       DELETE: Supprime la photo
       PATCH: Bascule la visibilité de la photo (photo_visible)
    """
    try:
        student = request.user.student
    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        if student.photo:
            student.photo.delete(save=True)
            return Response({'message': 'Photo supprimée avec succès'})
        return Response({'error': 'Aucune photo à supprimer'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        # Basculer la visibilité
        student.photo_visible = not student.photo_visible
        student.save()
        serializer = StudentSerializer(student, context={'request': request})
        return Response(serializer.data)

    # POST - Upload
    if 'photo' not in request.FILES:
        return Response({'error': 'Aucun fichier fourni'}, status=status.HTTP_400_BAD_REQUEST)
    
    photo_file = request.FILES['photo']
    
    # Validation du type de fichier (images uniquement)
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if photo_file.content_type not in allowed_types:
        return Response(
            {'error': 'Format non supporté. Utilisez JPG, PNG, GIF ou WebP'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validation de la taille (max 2MB)
    max_size = 2 * 1024 * 1024  # 2MB
    if photo_file.size > max_size:
        return Response(
            {'error': 'Fichier trop volumineux. Maximum 2MB.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Supprimer l'ancienne photo s'il existe
    if student.photo:
        student.photo.delete(save=False)
    
    # Sauvegarder la nouvelle photo
    student.photo = photo_file
    student.photo_visible = True  # Par défaut, la photo est visible
    student.save()
    
    # Retourner les infos mises à jour
    serializer = StudentSerializer(student, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@csrf_exempt
def reset_database(request):
    """
    ⚠️ SÉCURITÉ : Réinitialise la base de données en supprimant tous les matchs, swipes et entretiens.
    Permet de recommencer les tests de swipe.
    
    NOTE: Cette vue est désactivée en production pour éviter les abus.
    """
    from django.core.management import call_command
    
    # ⚠️ Protection : vérifier qu'on est en développement
    from django.conf import settings
    if not settings.DEBUG:
        return Response({
            'success': False,
            'error': 'Cette fonctionnalité est désactivée en production.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        call_command('reset_db', '--force')
        return Response({
            'success': True,
            'message': 'Base de données réinitialisée avec succès'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

