from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, JsonResponse

def simple_home(request):
    html = """
    <html>
      <head><title>Private Chat API</title></head>
      <body style="font-family: sans-serif; padding: 30px;">
        <h1>Private Chat API (MVP)</h1>
        <p>Welcome! Use the API under <code>/api/</code>.</p>
        <ul>
          <li><code>/api/auth/register/</code></li>
          <li><code>/api/auth/login/</code></li>
          <li><code>/api/auth/me/</code></li>
          <li><code>/api/friends/</code></li>
          <li><code>/api/messages/</code></li>
        </ul>
        <p><a href="/admin/">Admin</a> • <a href="/api/">API Index</a></p>
      </body>
    </html>
    """
    return HttpResponse(html)

def api_index(request):
    endpoints = {
        "register": "POST /api/auth/register/",
        "login": "POST /api/auth/login/",
        "me": "GET /api/auth/me/",
        "friends": "GET/POST /api/friends/",
        "room_with_user": "POST /api/room/with/<user_id>/",
        "messages_list": "GET /api/messages/?room=<id>",
        "messages_send": "POST /api/messages/send/",
        "vanish": "POST /api/room/<room_id>/vanish/"
    }
    return JsonResponse(endpoints)

urlpatterns = [
    path("", simple_home),
    path("admin/", admin.site.urls),
    path("api/", api_index),
    path("api/", include("chatapp.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
