import api from "./client";

export async function signupRequest(data) {
  const res = await api.post("/auth/signup", data);
  return res.data;
}

export async function loginRequest({ identifier, password }) {
  const res = await api.post("/auth/login", { identifier, password });
  return res.data;
}

export async function refreshRequest() {
  const res = await api.post("/auth/refresh");
  return res.data;
}

export async function logoutRequest() {
  const res = await api.post("/auth/logout");
  return res.data;
}