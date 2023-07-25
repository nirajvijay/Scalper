from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True},  # To ensure the password is write-only (not shown in response)
        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user
