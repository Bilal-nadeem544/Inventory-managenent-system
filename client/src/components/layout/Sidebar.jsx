import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  FileBarChart2,
  TrendingUp,
  Settings,
  LogOut,
  Boxes,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Inventory", path: "/inventory", icon: Package },
  { name: "Orders", path: "/orders", icon: ShoppingCart },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Invoices", path: "/invoices", icon: FileText },
  { name: "Reports", path: "/reports", icon: FileBarChart2 },
  { name: "Revenue", path: "/revenue", icon: TrendingUp },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 bg-[#FBF6EC] border-r border-[#E6D9C3]">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 h-16 border-b border-[#E6D9C3]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-800 to-orange-700 flex items-center justify-center">
          <Boxes size={18} className="text-white" />
        </div>
        <span className="font-semibold text-[#3B2F26] text-[15px] tracking-tight">
          StockPilot
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#F0E4CE] text-[#8A5A2B]"
                  : "text-[#8A7C68] hover:bg-[#F5EEE0] hover:text-[#3B2F26]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={isActive ? "text-[#8A5A2B]" : "text-[#B0A48D] group-hover:text-[#6B5D48]"}
                />
                {name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#8A7C68] hover:bg-rose-50 hover:text-rose-600 transition-colors">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
