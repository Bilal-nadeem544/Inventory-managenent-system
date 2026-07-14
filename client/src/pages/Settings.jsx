import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateProfileRequest, updatePasswordRequest } from "../api/settingsApi";

function Feedback({ feedback }) {
  if (!feedback) return null;
  const isSuccess = feedback.type === "success";
  return (
    <div
      className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg mt-3 ${
        isSuccess ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      }`}
    >
      {isSuccess ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {feedback.message}
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Note: after a page refresh the auth session-restore only confirms *that*
  // you're logged in, not your profile fields — so these can start blank if
  // the page was reloaded directly on Settings. Editing and saving still works fine.
  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileFeedback, setProfileFeedback] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwFeedback, setPwFeedback] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);

  function validateProfile() {
    const e = {};
    if (!profileForm.username.trim()) e.username = "Username zaroori hai";
    if (!profileForm.email.trim()) e.email = "Email zaroori hai";
    else if (!/^\S+@\S+\.\S+$/.test(profileForm.email)) e.email = "Valid email likhein";
    if (!/^[0-9\-]{7,15}$/.test(profileForm.phone)) e.phone = "Valid phone number likhein";
    setProfileErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileFeedback(null);
    if (!validateProfile()) return;
    setProfileSaving(true);
    try {
      const res = await updateProfileRequest(profileForm);
      setProfileFeedback({ type: "success", message: res.message || "Profile update ho gaya." });
    } catch (err) {
      setProfileFeedback({ type: "error", message: err.response?.data?.message || "Profile update nahi ho saka." });
    } finally {
      setProfileSaving(false);
    }
  }

  function validatePassword() {
    const e = {};
    if (!pwForm.current) e.current = "Current password likhein";
    if (!pwForm.next) e.next = "New password likhein";
    else if (pwForm.next.length < 8 || !/[0-9]/.test(pwForm.next)) {
      e.next = "Kam se kam 8 characters, aur 1 number zaroori hai";
    }
    if (pwForm.confirm !== pwForm.next) e.confirm = "Passwords match nahi karte";
    setPwErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwFeedback(null);
    if (!validatePassword()) return;
    setPwSaving(true);
    try {
      const res = await updatePasswordRequest({
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
        confirmPassword: pwForm.confirm,
      });
      setPwForm({ current: "", next: "", confirm: "" });
      setPwFeedback({ type: "success", message: res.message || "Password change ho gaya." });
      // Backend invalidates every session on password change — log out here too and
      // send the user back to login after a moment so they see the success message.
      setTimeout(async () => {
        await logout();
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      setPwFeedback({ type: "error", message: err.response?.data?.message || "Password update nahi ho saka." });
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
        <h3 className="text-sm font-semibold text-[#4A3D30] mb-1">Account Details</h3>
        <p className="text-xs text-[#B0A48D] mb-4">Username, email aur phone number update karein.</p>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Full Name</label>
            <input
              type="text"
              value={user?.fullName || ""}
              disabled
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] text-sm text-[#B0A48D] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Username</label>
            <input
              type="text"
              value={profileForm.username}
              onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
            />
            {profileErrors.username && <p className="text-xs text-rose-500 mt-1">{profileErrors.username}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Email</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
            />
            {profileErrors.email && <p className="text-xs text-rose-500 mt-1">{profileErrors.email}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Phone Number</label>
            <input
              type="text"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
            />
            {profileErrors.phone && <p className="text-xs text-rose-500 mt-1">{profileErrors.phone}</p>}
          </div>

          <button
            type="submit"
            disabled={profileSaving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-br from-amber-800 to-orange-700 hover:opacity-90 disabled:opacity-60"
          >
            {profileSaving ? "Saving..." : "Save Changes"}
          </button>

          <Feedback feedback={profileFeedback} />
        </form>
      </div>

      <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
        <h3 className="text-sm font-semibold text-[#4A3D30] mb-1">Change Password</h3>
        <p className="text-xs text-[#B0A48D] mb-4">
          Password change karne ke baad baaki devices se automatically logout ho jayega.
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Current Password</label>
            <input
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
            />
            {pwErrors.current && <p className="text-xs text-rose-500 mt-1">{pwErrors.current}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">New Password</label>
            <input
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
            />
            <p className="text-xs text-[#B0A48D] mt-1">Kam se kam 8 characters, aur 1 number zaroori hai.</p>
            {pwErrors.next && <p className="text-xs text-rose-500 mt-1">{pwErrors.next}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Confirm New Password</label>
            <input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
            />
            {pwErrors.confirm && <p className="text-xs text-rose-500 mt-1">{pwErrors.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={pwSaving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-br from-amber-800 to-orange-700 hover:opacity-90 disabled:opacity-60"
          >
            {pwSaving ? "Updating..." : "Update Password"}
          </button>

          <Feedback feedback={pwFeedback} />
        </form>
      </div>
    </div>
  );
}
