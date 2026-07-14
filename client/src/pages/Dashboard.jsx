import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Truck,
  PackageCheck,
  FileText,
} from "lucide-react";
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
  Legend,
  BarChart,
  Bar,
} from "recharts";
import StatCard from "../components/layout/StatCard";
import { fetchDashboardStats } from "../api/dashboardApi";
import {
  salesTrend,
  statusStyles,
} from "../data/dummyData";

const kpiIcons = [ClipboardCheck, Truck, PackageCheck, FileText];
const kpiColors = [
  { bg: "bg-[#F0E4CE]", icon: "text-[#8A5A2B]" },
  { bg: "bg-[#EFE3F0]", icon: "text-[#7A4E8C]" },
  { bg: "bg-emerald-50", icon: "text-emerald-600" },
  { bg: "bg-amber-50", icon: "text-amber-600" },
];

const PIE_COLORS = ["#92400E", "#C2793A", "#D9A441", "#7C9070", "#D6C7A8"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error("Dashboard stats load nahi hue:", err);
        setError("Dashboard data load nahi ho saka.");
      });
  }, []);

  const kpiData = stats
    ? [
        {
          label: "Orders Picked",
          value: stats.ordersPicked.value,
          change: `${stats.ordersPicked.change >= 0 ? "+" : ""}${stats.ordersPicked.change}%`,
          trend: stats.ordersPicked.change >= 0 ? "up" : "down",
        },
        {
          label: "Orders Shipped",
          value: stats.ordersShipped.value,
          change: `${stats.ordersShipped.change >= 0 ? "+" : ""}${stats.ordersShipped.change}%`,
          trend: stats.ordersShipped.change >= 0 ? "up" : "down",
        },
        {
          label: "Orders Delivered",
          value: stats.ordersDelivered.value,
          change: `${stats.ordersDelivered.change >= 0 ? "+" : ""}${stats.ordersDelivered.change}%`,
          trend: stats.ordersDelivered.change >= 0 ? "up" : "down",
        },
        {
          label: "Invoices Raised",
          value: stats.invoicesRaised.value,
          change: `${stats.invoicesRaised.change >= 0 ? "+" : ""}${stats.invoicesRaised.change}%`,
          trend: stats.invoicesRaised.change >= 0 ? "up" : "down",
        },
      ]
    : [];

  const weeklyOrders = stats?.weeklyOrders || [];
  const recentOrders = stats?.recentOrders || [];
  const lowStockProducts = stats?.lowStockProducts || [];
  const salesByCategory = stats?.salesByCategory || [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <StatCard
            key={kpi.label}
            icon={kpiIcons[i]}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            iconBg={kpiColors[i].bg}
            iconColor={kpiColors[i].icon}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales trend - line chart (dummy data, not yet wired) */}
        <div className="lg:col-span-2 bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
          <h3 className="text-sm font-semibold text-[#4A3D30] mb-4">
            Total Sales — Current vs Previous Period
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE6D5" />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#B0A48D" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#B0A48D" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E6D9C3", fontSize: 13 }} />
              <Line type="monotone" dataKey="current" stroke="#92400E" strokeWidth={2.5} dot={false} name="This period" />
              <Line type="monotone" dataKey="previous" stroke="#D6C7A8" strokeWidth={2} dot={false} name="Previous period" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by category - pie chart (real data) */}
        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
          <h3 className="text-sm font-semibold text-[#4A3D30] mb-4">Sales Breakdown by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={salesByCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                {salesByCategory.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E6D9C3", fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
            {salesByCategory.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-[#8A7C68]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {entry.name}
              </div>
            ))}
            {salesByCategory.length === 0 && (
              <p className="text-xs text-[#B0A48D]">Abhi koi sales data nahi hai.</p>
            )}
          </div>
        </div>
      </div>

      {/* Weekly orders - bar chart (real data) */}
      <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
        <h3 className="text-sm font-semibold text-[#4A3D30] mb-4">Weekly Order Volume</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyOrders}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE6D5" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#B0A48D" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#B0A48D" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E6D9C3", fontSize: 13 }} />
            <Bar dataKey="orders" fill="#92400E" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders (real data) */}
        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm overflow-x-auto">
          <h3 className="text-sm font-semibold text-[#4A3D30] mb-4">Recent Orders</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#B0A48D] border-b border-[#E6D9C3]">
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-[#EFE6D5] last:border-0">
                  <td className="py-3 text-[#4A3D30] font-medium">{o.id}</td>
                  <td className="py-3 text-[#8A7C68]">{o.customer}</td>
                  <td className="py-3 text-[#8A7C68]">Rs {o.amount.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[#B0A48D]">Koi order nahi mila.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Low Stock Products (real data) */}
        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm overflow-x-auto">
          <h3 className="text-sm font-semibold text-[#4A3D30] mb-4">Low Stock Products</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#B0A48D] border-b border-[#E6D9C3]">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">SKU</th>
                <th className="pb-2 font-medium">Quantity</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((p) => (
                <tr key={p.sku} className="border-b border-[#EFE6D5] last:border-0">
                  <td className="py-3 text-[#4A3D30] font-medium">{p.name}</td>
                  <td className="py-3 text-[#8A7C68]">{p.sku}</td>
                  <td className="py-3 text-[#8A7C68]">{p.quantity}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {lowStockProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[#B0A48D]">Sab products stock mein hain.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}