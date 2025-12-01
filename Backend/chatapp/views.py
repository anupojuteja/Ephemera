from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import FriendRequest, Room, Message
from .serializers import UserSerializer, FriendRequestSerializer, RoomSerializer, MessageSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.db import IntegrityError
from django.utils import timezone
from datetime import timedelta

# JWT endpoints use the library's views, we will re-expose in urls.

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(UserSerializer(request.user).data)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        data = request.data
        username = data.get("username")
        password = data.get("password")
        email = data.get("email", "")
        if not username or not password:
            return Response({"detail": "username and password required"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({"detail": "username exists"}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, email=email, password=password)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

class FriendRequestListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        # show incoming + outgoing for convenience
        incoming = FriendRequest.objects.filter(to_user=request.user)
        outgoing = FriendRequest.objects.filter(from_user=request.user)
        return Response({
            "incoming": FriendRequestSerializer(incoming, many=True).data,
            "outgoing": FriendRequestSerializer(outgoing, many=True).data
        })
    def post(self, request):
        serializer = FriendRequestSerializer(data=request.data)
        if serializer.is_valid():
            to_user_id = serializer.validated_data.get("to_user_id")
            to_user = get_object_or_404(User, id=to_user_id)
            if to_user == request.user:
                return Response({"detail":"cannot friend yourself"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                fr, created = FriendRequest.objects.get_or_create(from_user=request.user, to_user=to_user)
                if not created:
                    return Response({"detail":"request exists"}, status=status.HTTP_400_BAD_REQUEST)
            except IntegrityError:
                return Response({"detail":"error creating"}, status=status.HTTP_400_BAD_REQUEST)
            return Response(FriendRequestSerializer(fr).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FriendRequestAcceptView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        fr = get_object_or_404(FriendRequest, pk=pk, to_user=request.user)
        fr.accepted = True
        fr.save()
        return Response({"detail":"accepted"})

class RoomWithUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, user_id):
        other = get_object_or_404(User, id=user_id)
        # canonical ordering to satisfy unique_together
        u1, u2 = (request.user, other) if request.user.id < other.id else (other, request.user)
        room, created = Room.objects.get_or_create(user1=u1, user2=u2)
        return Response(RoomSerializer(room).data)

class MessagesListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        room_id = request.query_params.get("room")
        if not room_id:
            return Response({"detail":"room id required"}, status=status.HTTP_400_BAD_REQUEST)
        room = get_object_or_404(Room, id=room_id)
        if request.user != room.user1 and request.user != room.user2:
            return Response({"detail":"not in room"}, status=status.HTTP_403_FORBIDDEN)
        # drop expired messages server-side
        expired_qs = room.messages.filter(expires_at__isnull=False, expires_at__lte=timezone.now())
        expired_qs.delete()
        qs = room.messages.order_by("created_at").all().reverse()[:50]  # take last 50
        qs = reversed(list(qs))
        serializer = MessageSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

class MessageSendView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        data = request.data.copy()
        room_id = data.get("room")
        if not room_id:
            return Response({"detail":"room required"}, status=status.HTTP_400_BAD_REQUEST)
        room = get_object_or_404(Room, id=room_id)
        if request.user != room.user1 and request.user != room.user2:
            return Response({"detail":"not in room"}, status=status.HTTP_403_FORBIDDEN)
        # optional TTL in seconds
        ttl = data.get("ttl")  # optional: seconds
        if ttl:
            try:
                ttl = int(ttl)
                data["expires_at"] = timezone.now() + timedelta(seconds=ttl)
                data["is_ephemeral"] = True
            except:
                pass
        serializer = MessageSerializer(data=data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VanishRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, room_id):
        room = get_object_or_404(Room, id=room_id)
        if request.user != room.user1 and request.user != room.user2:
            return Response({"detail":"not in room"}, status=status.HTTP_403_FORBIDDEN)
        # delete ephemeral messages for the room
        room.messages.filter(is_ephemeral=True).delete()
        return Response({"detail":"ephemeral messages deleted"})
