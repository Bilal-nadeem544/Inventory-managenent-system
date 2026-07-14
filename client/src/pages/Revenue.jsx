import { useState, useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchRevenue } from "../api/revenueApi";

const presets = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const CATEGORY_COLORS = ["#92400E", "#C2793A", "#D9A441", "#7C9070", "#D6C7A8"];

export default function Revenue() {
  const [activePreset, setActivePreset] = useState("monthly");
  const [data, setData] = useState({ trend: [], totalOrders: 0, totalRevenue: 0, avgOrderValue: 0, breakdown: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchRevenue({ range: activePreset })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || "Revenue load nahi ho saka. Backend chal raha hai?");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activePreset]);

  const { trend, totalOrders, totalRevenue, avgOrderValue, breakdown } = data;
  const coloredBreakdown = breakdown.map((b, i) => ({ ...b, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-600 text-sm font-medium px-4 py-3 rounded-xl border border-rose-100">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="bg-[#FFFDF8] rounded-2xl p-4 border border-[#E6D9C3] shadow-sm flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePreset(p.key)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activePreset === p.key
                ? "bg-gradient-to-br from-amber-800 to-orange-700 text-white"
                : "bg-[#F1E9DC] text-[#6B5D48] hover:bg-[#EADFC9]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-[#8A7C68] py-20">
          <Loader2 size={18} className="animate-spin" />
          Loading revenue...
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
          <p className="text-sm text-[#8A7C68] font-medium">Total Revenue</p>
          <p className="text-2xl font-semibold text-[#3B2F26] mt-2">Rs {totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-[#B0A48D] mt-1">Delivered orders only</p>
        </div>
        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
          <p className="text-sm text-[#8A7C68] font-medium">Delivered Orders</p>
          <p className="text-2xl font-semibold text-[#3B2F26] mt-2">{totalOrders}</p>
        </div>
        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
          <p className="text-sm text-[#8A7C68] font-medium">Average Order Value</p>
          <p className="text-2xl font-semibold text-[#3B2F26] mt-2">Rs {avgOrderValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
          <h3 className="text-sm font-semibold text-[#4A3D30] mb-4">
            Revenue Trend — {presets.find((p) => p.key === activePreset)?.label}
          </h3>
          {trend.length === 0 ? (
            <p className="text-sm text-[#B0A48D] py-10 text-center">Is period ke liye koi revenue nahi.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE6D5" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#B0A48D" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#B0A48D" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E6D9C3", fontSize: 13 }} />
                <Line type="monotone" dataKey="revenue" stroke="#92400E" strokeWidth={2.5} dot={false} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
          <h3 className="text-sm font-semibold text-[#4A3D30] mb-4">Revenue by Category</h3>
          {coloredBreakdown.length === 0 ? (
            <p className="text-sm text-[#B0A48D] py-10 text-center">Koi data nahi.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={coloredBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {coloredBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `Rs ${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: 12, border: "1px solid #E6D9C3", fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {coloredBreakdown.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#6B5D48]">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name}
                    </span>
                    <span className="text-[#8A7C68]">Rs {entry.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
