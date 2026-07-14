import { useState, useEffect } from "react";
import { Download, AlertTriangle, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fetchReport } from "../api/reportsApi";

const presets = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
  { key: "custom", label: "Custom Range" },
];

export default function Reports() {
  const [activePreset, setActivePreset] = useState("weekly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [report, setReport] = useState({ trend: [], totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Custom range needs both dates picked before it's worth calling the API.
    if (activePreset === "custom" && (!customStart || !customEnd)) {
      setReport({ trend: [], totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 });
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    fetchReport({ range: activePreset, from: customStart, to: customEnd })
      .then((res) => {
        if (!cancelled) setReport(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || "Report load nahi ho saka. Backend chal raha hai?");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activePreset, customStart, customEnd]);

  const { trend, totalOrders, totalRevenue, avgOrderValue } = report;

  function handleExportCSV() {
    const rows = [["Period", "Orders", "Revenue"], ...trend.map((t) => [t.label, t.orderCount, t.revenue])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${activePreset}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-600 text-sm font-medium px-4 py-3 rounded-xl border border-rose-100">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="bg-[#FFFDF8] rounded-2xl p-4 border border-[#E6D9C3] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
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

        <button
          onClick={handleExportCSV}
          disabled={trend.length === 0}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#8A5A2B] bg-[#F0E4CE] hover:opacity-90 disabled:opacity-40 whitespace-nowrap"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {activePreset === "custom" && (
        <div className="bg-[#FFFDF8] rounded-2xl p-4 border border-[#E6D9C3] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[#8A7C68]">From</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[#8A7C68]">To</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26]"
            />
          </div>
          {(!customStart || !customEnd) && (
            <span className="text-xs text-[#B0A48D]">Dono dates select karein</span>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-[#8A7C68] py-20">
          <Loader2 size={18} className="animate-spin" />
          Loading report...
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
          <p className="text-sm text-[#8A7C68] font-medium">Number of Orders</p>
          <p className="text-2xl font-semibold text-[#3B2F26] mt-2">{totalOrders}</p>
        </div>
        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
          <p className="text-sm text-[#8A7C68] font-medium">Total Revenue</p>
          <p className="text-2xl font-semibold text-[#3B2F26] mt-2">Rs {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
          <p className="text-sm text-[#8A7C68] font-medium">Average Order Value</p>
          <p className="text-2xl font-semibold text-[#3B2F26] mt-2">Rs {avgOrderValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
        <h3 className="text-sm font-semibold text-[#4A3D30] mb-4">
          Order Trend — {presets.find((p) => p.key === activePreset)?.label}
        </h3>
        {trend.length === 0 ? (
          <p className="text-sm text-[#B0A48D] py-10 text-center">Is period ke liye koi data nahi.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
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
      </>
      )}
    </div>
  );
}
