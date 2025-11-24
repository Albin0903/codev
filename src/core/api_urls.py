from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.views.decorators.csrf import csrf_exempt
from . import api_views

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'companies', api_views.CompanyViewSet, basename='company')
router.register(r'swipes', api_views.SwipeViewSet, basename='swipe')
router.register(r'matches', api_views.MatchViewSet, basename='match')
router.register(r'interviews', api_views.InterviewViewSet, basename='interview')

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    path('me/', api_views.current_user, name='current-user'),
    path('login/', csrf_exempt(api_views.login_view), name='login'),
    path('logout/', api_views.logout_view, name='logout'),
]
