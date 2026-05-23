"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {trend && <p className="text-green-400 text-xs mt-1">{trend}</p>}
      </div>
      <div className="text-blue-400 bg-blue-900/30 p-3 rounded-lg">{icon}</div>
    </div>
  );
}
