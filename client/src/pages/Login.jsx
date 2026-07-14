
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpenCheckIcon, Boxes } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.identifier.trim() || !form.password) {
      setError("Invalid credentials");
      return;
    }
    setLoading(true);
    try {
      await login({ identifier: form.identifier, password: form.password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

        <h1 className="text-lg font-semibold text-[#3B2F26] mb-1">Log In</h1>
        <p className="text-sm text-[#8A7C68] mb-5">Apne account mein login karein.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Email or Username</label>
            <input
              type="text"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-br from-amber-800 to-orange-700 hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-xs text-[#8A7C68] text-center mt-5">
          Account nahi hai?{" "}
          <Link to="/signup" className="text-[#8A5A2B] font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}