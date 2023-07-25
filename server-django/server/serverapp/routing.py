# myapp/routing.py
from django.urls import re_path
from serverapp.consumers import LastTradedPriceConsumer  # Replace 'myapp' with your app name

websocket_urlpatterns = [
    re_path(r'last_traded_price/', LastTradedPriceConsumer.as_asgi()),
]
