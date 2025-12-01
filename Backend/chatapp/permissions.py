from rest_framework.permissions import BasePermission

class IsRoomParticipant(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj is Room
        return request.user == obj.user1 or request.user == obj.user2
