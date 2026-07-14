import api from "./client";

// PUT /api/settings/profile — body: { username, email, phone }
export async function updateProfileRequest(payload) {
  const res = await api.put("/settings/profile", payload);
  return res.data; // { success, message, user }
}

// PUT /api/settings/password — body: { currentPassword, newPassword, confirmPassword }
// On success the backend clears the refresh cookie and bumps tokenVersion —
// every session (including this one) is invalidated, so the caller must log out.
export async function updatePasswordRequest(payload) {
  const res = await api.put("/settings/password", payload);
  return res.data;
}
