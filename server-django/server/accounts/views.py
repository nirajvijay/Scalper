from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser
from .serializers import UserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_authentication(request):
    return JsonResponse({'authenticated': True}, status=200, safe=False)

class SignUpView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User registration successful.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SignInView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Check if the email and password are provided
        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Retrieve the user with the provided email
            user = CustomUser.objects.get(email=email)

            # Check if the user is active
            if not user.is_active:
                return Response({'error': 'User account is not active.'}, status=status.HTTP_401_UNAUTHORIZED)

            # Verify if the provided password matches the hashed password
            if user.check_password(password):
                return Response({'message': 'Authentication successful.'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Authentication failed. Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        except CustomUser.DoesNotExist:
            return Response({'error': 'User account not found.'}, status=status.HTTP_401_UNAUTHORIZED)
