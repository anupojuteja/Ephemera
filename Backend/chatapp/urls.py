from django.urls import path
from .views import (
    MeView, RegisterView, FriendRequestListCreateView, 
    FriendRequestAcceptView, RoomWithUserView, MessagesListView, 
    MessageSendView, VanishRoomView, AvatarUpdateView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("user/avatar/", AvatarUpdateView.as_view(), name="avatar-update"),

    path("friends/", FriendRequestListCreateView.as_view(), name="friends"),
    path("friends/<int:pk>/accept/", FriendRequestAcceptView.as_view(), name="friend-accept"),

    path("room/with/<int:user_id>/", RoomWithUserView.as_view(), name="room-with"),
    path("room/<int:room_id>/vanish/", VanishRoomView.as_view(), name="room-vanish"),

    path("messages/", MessagesListView.as_view(), name="messages-list"),
    path("messages/send/", MessageSendView.as_view(), name="messages-send"),
]
