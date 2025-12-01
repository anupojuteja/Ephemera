from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name="sent_requests", on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name="received_requests", on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("from_user", "to_user")

    def __str__(self):
        return f"{self.from_user} -> {self.to_user} ({'accepted' if self.accepted else 'pending'})"

class Room(models.Model):
    # For MVP, support only 1-to-1 rooms. For later groups add participants M2M.
    user1 = models.ForeignKey(User, related_name="rooms_user1", on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name="rooms_user2", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user1", "user2")

    def __str__(self):
        return f"Room: {self.user1.id} <-> {self.user2.id}"

class Message(models.Model):
    room = models.ForeignKey(Room, related_name="messages", on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(blank=True)
    image = models.ImageField(upload_to="messages/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_ephemeral = models.BooleanField(default=False)  # vanish on close
    expires_at = models.DateTimeField(null=True, blank=True)  # optional TTL

    def is_expired(self):
        if self.expires_at:
            return timezone.now() >= self.expires_at
        return False

    def __str__(self):
        return f"{self.sender}: {self.text[:20]}"
