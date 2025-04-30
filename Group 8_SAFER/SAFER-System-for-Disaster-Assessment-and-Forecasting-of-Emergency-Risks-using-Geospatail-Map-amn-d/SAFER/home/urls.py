from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('voice-controlled-map/', views.vcm, name='vcm'),
    path('ambulance/', views.ambulance, name='ambulance'),
    path('quick_first_aid/', views.quick_first_aid, name='quick_first_aid'),
    path('disaster_assessment/', views.disaster_assessment, name='disaster_assessment'),
]