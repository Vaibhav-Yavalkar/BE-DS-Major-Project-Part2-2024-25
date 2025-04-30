from django.urls import path
from .views import send_sms, track, receive_location

urlpatterns = [
    path("send_sms/", send_sms, name="send_sms"), 
    path("track/", track, name="track"), 
    path('receive-location/', receive_location, name="receive_location"),
]
