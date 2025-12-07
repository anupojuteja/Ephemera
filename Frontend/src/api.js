import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const instance = axios.create({
  baseURL: API_BASE,
});

// Attach access token automatically
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// simple helper to refresh token when needed
async function refreshTokenIfNeeded() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;
  try {
    const resp = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
    localStorage.setItem("access_token", resp.data.access);
    return true;
  } catch (e) {
    console.error("refresh failed", e);
    return false;
  }
}

// wrapper that retries once on 401
async function request(config) {
  try {
    return await instance.request(config);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      const ok = await refreshTokenIfNeeded();
      if (ok) {
        return await instance.request(config);
      }
    }
    throw err;
  }
}

export default {
  // Auth
  async login(username, password) {
    const resp = await axios.post(`${API_BASE}/auth/login/`, { username, password });
    localStorage.setItem("access_token", resp.data.access);
    localStorage.setItem("refresh_token", resp.data.refresh);
    return resp.data;
  },

  async register(username, password, email = "") {
    const resp = await request({ url: "/auth/register/", method: "post", data: { username, password, email } });
    return resp.data;
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  async me() {
    const resp = await request({ url: "/auth/me/", method: "get" });
    return resp.data;
  },

  async updateAvatar(file) {
    const form = new FormData();
    form.append("avatar", file);
    // Explicit PUT to avatar endpoint
    const resp = await request({
      url: "/user/avatar/",
      method: "put",
      data: form,
      headers: { "Content-Type": "multipart/form-data" }
    });
    return resp.data;
  },

  // Friends
  async friendList() {
    const resp = await request({ url: "/friends/", method: "get" });
    return resp.data;
  },
  async sendFriendRequest(to_user_id) {
    const resp = await request({ url: "/friends/", method: "post", data: { to_user_id } });
    return resp.data;
  },
  async acceptFriendRequest(pk) {
    const resp = await request({ url: `/friends/${pk}/accept/`, method: "post" });
    return resp.data;
  },

  // Rooms & messages
  async roomWith(user_id) {
    const resp = await request({ url: `/room/with/${user_id}/`, method: "post" });
    return resp.data;
  },

  async listMessages(room_id) {
    const resp = await request({ url: `/messages/?room=${room_id}`, method: "get" });
    return resp.data;
  },

  async sendText(room, text, ttl = null) {
    const data = { room, text };
    if (ttl) data.ttl = ttl;
    const resp = await request({ url: "/messages/send/", method: "post", data });
    return resp.data;
  },

  async sendImage(room, file, ttl = null) {
    const form = new FormData();
    form.append("room", room);
    form.append("image", file);
    if (ttl) form.append("ttl", ttl);
    const resp = await request({ url: "/messages/send/", method: "post", data: form, headers: { "Content-Type": "multipart/form-data" } });
    return resp.data;
  },

  async vanish(room_id) {
    const resp = await request({ url: `/room/${room_id}/vanish/`, method: "post" });
    return resp.data;
  }
};
