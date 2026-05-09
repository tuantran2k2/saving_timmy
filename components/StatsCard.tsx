"use client";

import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  color: "green" | "red" | "blue" | "purple";
  trend?: { value: string; positive: boolean };
}

const colorMap = {
  green: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
    value: "text-emerald-700",
    border: "border-emerald-100",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-100 text-red-600",
    value: "text-red-700",
    border: "border-red-100",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    value: "text-blue-700",
    border: "border-blue-100",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    value: "text-purple-700",
    border: "border-purple-100",
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div
      className={`rounded-2xl border ${c.border} ${c.bg} p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`rounded-xl p-2 ${c.icon}`}>{icon}</div>
      </div>
      <div>
        <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {trend && (
        <div
          className={`text-xs font-medium ${trend.positive ? "text-emerald-600" : "text-red-500"}`}
        >
          {trend.positive ? "▲" : "▼"} {trend.value}
        </div>
      )}
    </div>
  );
}
