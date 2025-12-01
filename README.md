# Ephemera

# Private Chat (MVP) — Django + Vite React

## Overview
Simple private chat MVP:
- Django 5 + Django REST Framework backend
- SimpleJWT auth (access + refresh)
- Image upload (Pillow)
- Polling on frontend (every 2 seconds)
- "Vanish on close" (ephemeral messages) + TTL option

Later we will add Channels/WebSockets for typing indicators, real-time messages, and WebRTC signaling.

## Folder layout
(see the provided tree in the project root)

## Quick install (Linux / macOS / WSL)

### Backend
1. Create and activate a virtualenv:
```bash
cd private-chat/backend
python -m venv .venv
source .venv/bin/activate
