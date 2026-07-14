import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Boxes, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  fullName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name zaroori hai";
    if (!form.username.trim()) e.username = "Username zaroori hai";
    if (!form.email.trim()) e.email = "Email zaroori hai";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email likhein";
    if (!/^[0-9\-]{7,15}$/.test(form.phone)) e.phone = "Valid phone number likhein";
    if (!form.password || form.password.length < 8 || !/[0-9]/.test(form.password)) {
      e.password = "Kam se kam 8 characters, aur 1 number zaroori hai";
    }
    if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords match nahi karte";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await signup(form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1E9DC] p-4">
        <div className="bg-[#FFFDF8] rounded-2xl w-full max-w-sm p-7 border border-[#E6D9C3] shadow-sm text-center">
          <CheckCircle2 size={36} className="text-emerald-600 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-[#3B2F26]">Account ban gaya!</h2>
          <p className="text-sm text-[#8A7C68] mt-1">Login page par le ja rahe hain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1E9DC] p-4">
      <div className="bg-[#FFFDF8] rounded-2xl w-full max-w-sm p-7 border border-[#E6D9C3] shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-800 to-orange-700 flex items-center justify-center">
            <Boxes size={18} className="text-white" />
          </div>
          <span className="font-semibold text-[#3B2F26] text-[15px]">StockPilot</span>
        </div>

        <h1 className="text-lg font-semibold text-[#3B2F26] mb-1">Sign Up</h1>
        <p className="text-sm text-[#8A7C68] mb-5">Naya account banayein.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
            />
            {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
            />
            {errors.username && <p className="text-xs text-rose-500 mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
            />
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Phone Number</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
            />
            {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
            />
            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
            />
            {errors.confirmPassword && <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          {serverError && <p className="text-xs text-rose-500">{serverError}</p>}
          
           
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-br from-amber-800 to-orange-700 hover:opacity-90 disabled:opacity-60 mt-2"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-xs text-[#8A7C68] text-center mt-5">
          Already an account?{" "}
          <Link to="/login" className="text-[#8A5A2B] font-medium hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}