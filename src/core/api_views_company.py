from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Student, Company, InternshipOffer, Match, Interview, CompanySwipe
from .serializers import (
    StudentSerializer, CompanySerializer, InternshipOfferSerializer, 
    MatchSerializer, InterviewSerializer, CompanySwipeSerializer
)
from .permissions import IsCompany, CanOnlyModifyOwnData


class CompanyStudentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def next_card(self, request):
        try:
            company = request.user.company
            swiped_students = CompanySwipe.objects.filter(company=company).values_list('student_id', flat=True)
            
            from django.db.models import Max
            from .models import MatchScore
            
            best_scores = (
                MatchScore.objects
                .filter(offer__company=company)
                .exclude(student_id__in=swiped_students)
                .values('student_id')
                .annotate(best_score=Max('score'))
                .order_by('-best_score')
            )
            
            if best_scores:
                top = best_scores[0]
                best_student = Student.objects.select_related('user').get(id=top['student_id'])
                best_score = top['best_score']
                serializer = self.get_serializer(best_student, context={'request': request})
                data = serializer.data
                data['match_score'] = best_score
                return Response(data)
            
            # fallback: étudiant sans score pré-calculé
            fallback = Student.objects.exclude(id__in=swiped_students).select_related('user').first()
            if fallback:
                serializer = self.get_serializer(fallback, context={'request': request})
                data = serializer.data
                data['match_score'] = 0
                return Response(data)
            
            return Response({'detail': 'Plus d\'étudiant'}, status=status.HTTP_204_NO_CONTENT)
        except Company.DoesNotExist:
            return Response({'error': 'Profil entreprise introuvable'}, status=status.HTTP_400_BAD_REQUEST)


class CompanySwipeViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySwipeSerializer
    permission_classes = [IsAuthenticated, IsCompany, CanOnlyModifyOwnData]
    
    def get_queryset(self):
        """Retourner uniquement les swipes de l'entreprise connectée"""
        try:
            return CompanySwipe.objects.filter(company=self.request.user.company)
        except Company.DoesNotExist:
            return CompanySwipe.objects.none()
    
    def create(self, request):
        try:
            company = request.user.company
        except Company.DoesNotExist:
            return Response(
                {'error': 'Profil entreprise introuvable'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        student_id = request.data.get('student_id')
        direction = request.data.get('direction')
        
        if not student_id or not direction:
            return Response(
                {'error': 'student_id et direction requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # validation: la direction doit être 'left' ou 'right'
        if direction not in ['left', 'right']:
            return Response(
                {'error': 'la direction doit être "left" ou "right"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        student = get_object_or_404(Student, id=student_id)
        
        swipe, created = CompanySwipe.objects.get_or_create(
            company=company,
            student=student,
            defaults={'direction': direction}
        )
        
        # Vérifier s'il y a match mutuel
        match_created = False
        is_mutual = False
        
        if direction == 'right':
            # Vérifier si l'étudiant a aussi liké cette entreprise
            from .models import Swipe
            student_liked = Swipe.objects.filter(
                student=student,
                company=company,
                direction='right'
            ).exists()
            
            if student_liked:
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
        
        return Response({
            'swipe': {
                'id': swipe.id,
                'company_id': company.id,
                'student_id': student.id,
                'direction': swipe.direction,
                'created_at': swipe.created_at
            },
            'match': match_created or is_mutual,
            'created': created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CompanyOfferViewSet(viewsets.ModelViewSet):
    serializer_class = InternshipOfferSerializer
    permission_classes = [IsAuthenticated, IsCompany]
    pagination_class = None

    def get_queryset(self):
        try:
            return InternshipOffer.objects.filter(company=self.request.user.company)
        except Company.DoesNotExist:
            return InternshipOffer.objects.none()

    def create(self, request):
        try:
            company = request.user.company
        except Company.DoesNotExist:
            return Response(
                {'error': 'Profil entreprise introuvable'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(company=company)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            if instance.company != request.user.company:
                return Response(
                    {'error': 'vous ne pouvez modifier que vos propres offres'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Company.DoesNotExist:
            return Response(
                {'error': 'Profil entreprise introuvable'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        """Mise à jour partielle (PATCH)"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            if instance.company != request.user.company:
                return Response(
                    {'error': 'vous ne pouvez supprimer que vos propre offre'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Company.DoesNotExist:
            return Response(
                {'error': 'Profil entreprise introuvable'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated, IsCompany])
def current_company(request):
    try:
        company = request.user.company
    except Company.DoesNotExist:
        return Response({'error': 'Profil entreprise introuvable'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CompanySerializer(company, context={'request': request})
        return Response(serializer.data)

    # patch - Seulement si c'est l'utilisateur authentifié
    if company.user != request.user:
        return Response(
            {'error': 'vous ne pouvez modifier que votre propre profil'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = CompanySerializer(company, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def company_matches(request):
    try:
        company = request.user.company
        matches = Match.objects.filter(
            company=company,
            is_mutual=True
        ).select_related('student__user', 'company').order_by('-created_at')
        
        from .serializers import MatchSerializer
        serializer = MatchSerializer(matches, many=True, context={'request': request})
        return Response(serializer.data)
    except Company.DoesNotExist:
        return Response({'error': 'Profil entreprise introuvable'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def company_interviews(request):
    try:
        company = request.user.company
        interviews = Interview.objects.filter(
            match__company=company
        ).select_related('match__student__user', 'match__company').order_by('time_slot')
        
        serializer = InterviewSerializer(interviews, many=True, context={'request': request})
        return Response(serializer.data)
    except Company.DoesNotExist:
        return Response({'error': 'Profil entreprise introuvable'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated, IsCompany])
def upload_company_logo(request):
    try:
        company = request.user.company
    except Company.DoesNotExist:
        return Response({'error': 'Profil entreprise introuvable'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        if company.logo:
            company.logo.delete(save=True)
            serializer = CompanySerializer(company, context={'request': request})
            return Response(serializer.data)
        return Response({'error': 'aucun logo à supprimer'}, status=status.HTTP_404_NOT_FOUND)

    # post upload
    if 'logo' not in request.FILES:
        return Response({'error': 'aucun fichier fourni'}, status=status.HTTP_400_BAD_REQUEST)

    logo_file = request.FILES['logo']
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if logo_file.content_type not in allowed_types:
        return Response({'error': 'format non supporté. utilisez jpg, png, gif ou webp'}, status=status.HTTP_400_BAD_REQUEST)

    max_size = 2 * 1024 * 1024
    if logo_file.size > max_size:
        return Response({'error': 'fichier trop volumineux. maximum 2mb.'}, status=status.HTTP_400_BAD_REQUEST)

    if company.logo:
        company.logo.delete(save=False)

    company.logo = logo_file
    company.save()

    serializer = CompanySerializer(company, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)
