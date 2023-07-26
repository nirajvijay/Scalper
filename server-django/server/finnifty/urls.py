from django.urls import path , re_path
from . import views

urlpatterns = [
    
    path('last_traded_price_finnifty/', views.last_traded_price, name='last_traded_price'),
    
]