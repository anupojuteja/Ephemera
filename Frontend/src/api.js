// frontend/src/api.js
// Axios instance + helper functions for auth and chat.
// Uses guarded storage access to avoid "Access to storage is not allowed" runtime errors.

import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

// ---------- Safe storage helpers ----------
function safeGet(key) {
  try {
    if (typeof window !== "undefined" && window.localStorage) return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
  return null;
}
function safeSet(key, val) {
  try {
    if (typeof window !== "undefined" && window.localStorage) localStorage.setItem(key, val);
  } catch (e) {}
}
function safeRemove(key) {
  try {
    if (typeof window !== "undefined" && window.localStorage) localStorage.removeItem(key);
  } catch (e) {}
}

// ---------- Axios instance ----------
const instance = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

// attach access token automatically if available
instance.interceptors.request.use((config) => {
  const token = safeGet("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

// ---------- Auth helpers ----------
async function login(username, password) {
  const resp = await instance.post("/api/auth/login/", { username, password });
  if (resp?.data?.access) {
    safeSet("access_token", resp.data.access);
    safeSet("refresh_token", resp.data.refresh || "");
  }
  return resp.data;
}
async function refresh() {
  const refresh_token = safeGet("refresh_token");
  if (!refresh_token) throw new Error("no refresh");
  const resp = await instance.post("/api/auth/refresh/", { refresh: refresh_token });
  if (resp?.data?.access) safeSet("access_token", resp.data.access);
  return resp.data;
}
async function me() {
  const resp = await instance.get("/api/auth/me/");
  return resp.data;
}
async function register(payload) {
  const resp = await instance.post("/api/auth/register/", payload);
  return resp.data;
}
function logout() {
  safeRemove("access_token");
  safeRemove("refresh_token");
}

// ---------- Friends / Rooms / Messages ----------
async function listFriends() {
  const resp = await instance.get("/api/friends/");
  return resp.data;
}
async function roomWith(userId) {
  const resp = await instance.post(`/api/room/with/${userId}/`);
  return resp.data;
}
async function listMessages(roomId) {
  const resp = await instance.get(`/api/messages/?room=${roomId}`);
  return resp.data;
}
async function sendText(roomId, text) {
  const resp = await instance.post("/api/messages/send/", { room: roomId, text });
  return resp.data;
}
async function sendImage(roomId, file) {
  const fd = new FormData();
  fd.append("room", roomId);
  fd.append("image", file);
  const resp = await instance.post("/api/messages/send/", fd, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return resp.data;
}
async function vanish(roomId) {
  const resp = await instance.post(`/api/room/${roomId}/vanish/`);
  return resp.data;
}

export default {
  login,
  refresh,
  me,
  register,
  logout,
  listFriends,
  roomWith,
  listMessages,
  sendText,
  sendImage,
  vanish,
};
