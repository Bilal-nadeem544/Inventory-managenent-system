import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function getInitials(fullName) {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || fullName[0].toUpperCase();
}

export default function Navbar({ title = "Dashboard" }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-10 h-16 bg-[#FBF6EC] border-b border-[#E6D9C3] flex items-center justify-between px-4 md:px-8">
      <h1 className="text-lg font-semibold text-[#3B2F26]">{title}</h1>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-[#F1E9DC] rounded-lg px-3 py-2 w-56 lg:w-72">
          <Search size={16} className="text-[#B0A48D]" />
          <input
            type="text"
            placeholder="Search products, orders..."
            className="bg-transparent outline-none text-sm text-[#6B5D48] placeholder:text-[#B0A48D] w-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-[#F1E9DC] transition-colors">
          <Bell size={19} className="text-[#8A7C68]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-800 to-orange-700 flex items-center justify-center text-white text-sm font-semibold">
              {getInitials(user?.fullName)}
            </div>
            <ChevronDown size={16} className="text-[#B0A48D] hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-[#FBF6EC] rounded-lg shadow-lg border border-[#E6D9C3] py-1 text-sm">
              <a href="#" className="block px-4 py-2 text-[#6B5D48] hover:bg-[#F1E9DC]">My Profile</a>
              <a href="#" className="block px-4 py-2 text-[#6B5D48] hover:bg-[#F1E9DC]">Account Settings</a>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-rose-600 hover:bg-[#F1E9DC]">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
