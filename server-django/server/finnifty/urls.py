from django.urls import path , re_path
from . import views

urlpatterns = [
    
    path('last_traded_price_finnifty/', views.last_traded_price_finnifty, name='last_traded_price'),
    
]