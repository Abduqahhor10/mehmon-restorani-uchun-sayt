from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle


class LoginThrottle(ScopedRateThrottle):
    scope = 'login'


def _user_payload(user):
    return {
        'id': user.id,
        'username': user.username,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    }


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([LoginThrottle])
def login_view(request):
    """
    Exchange staff credentials for an API token used by the admin panel.
    """
    username = (request.data.get('username') or '').strip()
    password = request.data.get('password') or ''

    if not username or not password:
        return Response(
            {'detail': "Foydalanuvchi nomi va parol kiritilishi shart."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=username, password=password)
    if user is None or not user.is_active:
        return Response(
            {'detail': "Foydalanuvchi nomi yoki parol noto'g'ri."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_staff:
        return Response(
            {'detail': "Bu hisobda admin panelga kirish huquqi yo'q."},
            status=status.HTTP_403_FORBIDDEN,
        )

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': _user_payload(user)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Invalidate the caller's token.
    """
    Token.objects.filter(user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    Confirm a stored token is still valid when the admin panel boots.
    """
    return Response(_user_payload(request.user))
