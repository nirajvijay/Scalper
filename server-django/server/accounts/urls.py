from django.urls import path
from .views import SignUpView, SignInView
from . import views

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('signin/', SignInView.as_view(), name='signin'),
    path('check_authentication/', views.check_authentication, name='check_authentication'),

]
