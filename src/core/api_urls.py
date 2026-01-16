from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.views.decorators.csrf import csrf_exempt
from . import api_views
from . import api_views_company

# Router pour les ViewSets
router = DefaultRouter()
# Routes pour les étudiants
router.register(r'companies', api_views.CompanyViewSet, basename='company')
router.register(r'swipes', api_views.SwipeViewSet, basename='swipe')
router.register(r'matches', api_views.MatchViewSet, basename='match')
router.register(r'interviews', api_views.InterviewViewSet, basename='interview')
# Routes pour les entreprises
router.register(r'company/students', api_views_company.CompanyStudentViewSet, basename='company-students')
router.register(r'company/swipes', api_views_company.CompanySwipeViewSet, basename='company-swipes')
router.register(r'company/offers', api_views_company.CompanyOfferViewSet, basename='company-offers')

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    # Routes étudiants
    path('me/', api_views.current_user, name='current-user'),
    path('cv/', api_views.upload_cv, name='upload-cv'),
    path('photo/', api_views.upload_photo, name='upload-photo'),
    # Routes entreprises
    path('company/me/', api_views_company.current_company, name='current-company'),
    path('company/logo/', api_views_company.upload_company_logo, name='company-logo'),
    path('company/matches/', api_views_company.company_matches, name='company-matches'),
    path('company/interviews/', api_views_company.company_interviews, name='company-interviews'),
    # Admin
    path('reset-db/', api_views.reset_database, name='reset-db'),
    # Auth
    path('login/', csrf_exempt(api_views.login_view), name='login'),
    path('logout/', api_views.logout_view, name='logout'),
    path('register/', api_views.RegisterView.as_view(), name='register'),
]

