"use client";

import { StatCard } from "@/components/StatCard";
import { MessageSquare, CalendarCheck, Users, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Chi tiết</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Tổng tin nhắn" value="1,240" icon={<MessageSquare size={20} />} trend="+8%" />
        <StatCard title="Tổng booking" value="156" icon={<CalendarCheck size={20} />} trend="+12%" />
        <StatCard title="Khách hàng" value="89" icon={<Users size={20} />} trend="+3%" />
        <StatCard title="Doanh thu tháng" value="892M" icon={<TrendingUp size={20} />} trend="+22%" />
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Hoạt động gần đây</h2>
        <ul className="space-y-3 text-sm text-gray-300">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            AI tư vấn tour Nhật Bản cho khách Nguyễn Văn A
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Booking #BK-001 được xác nhận
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Khách hỏi visa Hàn Quốc — AI trả lời tự động
          </li>
        </ul>
      </div>
    </div>
  );
}
