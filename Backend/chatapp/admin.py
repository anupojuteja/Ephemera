from django.contrib import admin
from .models import FriendRequest, Room, Message

admin.site.register(FriendRequest)
admin.site.register(Room)
admin.site.register(Message)
