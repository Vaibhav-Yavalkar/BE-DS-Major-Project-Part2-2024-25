from django.urls import path
from .views import report_generator

urlpatterns = [
    path("report_generator/", report_generator, name="report_generator"), 
]
