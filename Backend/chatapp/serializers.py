from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FriendRequest, Room, Message
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "avatar")

    def get_avatar(self, obj):
        if hasattr(obj, 'profile') and obj.profile.avatar:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile.avatar.url)
            return obj.profile.avatar.url
        return None

class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)
    to_user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = FriendRequest
        fields = ("id", "from_user", "to_user", "to_user_id", "accepted", "created_at")
        read_only_fields = ("accepted", "created_at")

class RoomSerializer(serializers.ModelSerializer):
    user1 = UserSerializer(read_only=True)
    user2 = UserSerializer(read_only=True)

    class Meta:
        model = Room
        fields = ("id", "user1", "user2", "created_at")

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ("id", "room", "sender", "text", "image", "image_url", "created_at", "is_ephemeral", "expires_at")
        read_only_fields = ("id", "sender", "created_at")

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        if obj.image:
            return obj.image.url
        return None

    def validate(self, data):
        # ensure either text or image present
        if not data.get("text") and not self.context["request"].FILES.get("image"):
            raise serializers.ValidationError("Either text or image must be provided.")
        return data

    def create(self, validated_data):
        # handle image from request.FILES
        request = self.context.get("request")
        image = request.FILES.get("image")
        message = Message(**validated_data)
        if image:
            message.image = image
        message.sender = request.user
        message.save()
        return message
