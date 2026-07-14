import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ icon: Icon, label, value, change, trend, iconBg, iconColor }) {
  const isUp = trend === "up";
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#B0A48D] font-medium">{label}</p>
          <p className="text-2xl font-semibold text-[#3B2F26] mt-2">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
      {change && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change} <span className="text-[#B0A48D] font-normal">vs last period</span>
        </div>
      )}
    </div>
  );
}
