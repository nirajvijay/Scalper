from django.urls import path , re_path
from . import views
from . import consumers



urlpatterns = [
    path('last_traded_price_ce/', views.last_traded_price_ce, name='last_traded_price'),
    path('last_traded_price_pe/', views.last_traded_price_ce, name='last_traded_price'),
    path('last_traded_price/', views.last_traded_price, name='last_traded_price'),
    path('placeOrder/', views.place_order, name='place_order'),
    path('sellOrder/', views.sellOrder, name='sellOrder'),
    path('close_all/', views.close_all, name='closeAll'),
    path('order_book/', views.order_book, name='orderbook'),
    path('getAccessToken/', views.get_accesstoken, name='access_token'),
    path('getStrike/', views.get_strike, name='get_strike'),
]
