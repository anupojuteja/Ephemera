// frontend/src/api.js
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

instance.interceptors.request.use((config) => {
  const token = safeGet("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

// ---------- Auth ----------
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

// ---------- Friends / Rooms / Users / Messages ----------

// PRIMARY: fetch friends list (your backend responds on /api/friends/)
async function getFriends() {
  try {
    const resp = await instance.get("/api/friends/");
    if (Array.isArray(resp.data)) return resp.data;
    if (Array.isArray(resp.data.results)) return resp.data.results;
  } catch (e) {
    // caller will handle fallback if required
  }
  return [];
}

// Keep the other helpers (we keep getRooms/getUsers but they are no longer probed by default)
async function getRooms() {
  try {
    const resp = await instance.get("/api/rooms/");
    if (Array.isArray(resp.data)) return resp.data;
    if (Array.isArray(resp.data.results)) return resp.data.results;
  } catch (e) {}
  try {
    const resp2 = await instance.get("/api/room/");
    if (Array.isArray(resp2.data)) return resp2.data;
  } catch (e) {}
  return null;
}
async function getUsers() {
  try {
    const resp = await instance.get("/api/users/");
    if (Array.isArray(resp.data)) return resp.data;
    if (Array.isArray(resp.data.results)) return resp.data.results;
  } catch (e) {
    try {
      const r2 = await instance.get("/api/friends/");
      if (Array.isArray(r2.data)) return r2.data;
    } catch (err) {}
  }
  return [];
}

async function roomWith(userId) {
  try {
    const resp = await instance.post(`/api/room/with/${userId}/`);
    return resp.data;
  } catch (e) {
    try {
      const resp2 = await instance.get(`/api/room/with/${userId}/`);
      return resp2.data;
    } catch (err) {
      return { id: `tmp-${userId}`, participants: [userId] };
    }
  }
}

async function listMessages(roomId) {
  const resp = await instance.get(`/api/messages/?room=${roomId}`);
  return resp.data || [];
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
  // auth
  login,
  refresh,
  me,
  register,
  logout,
  // primary list for sidebar
  getFriends,
  // fallbacks (kept for future)
  getRooms,
  getUsers,
  // room/messages
  roomWith,
  listMessages,
  sendText,
  sendImage,
  vanish,
};
