from django.contrib import admin
from django.urls import path, include, re_path
from serverapp.routing import websocket_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('serverapp.urls')),
    path('api/', include('accounts.urls')),
    re_path(r'ws/', include(websocket_urlpatterns)),
]
