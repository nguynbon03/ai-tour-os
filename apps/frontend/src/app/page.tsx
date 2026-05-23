import { StatCard } from "@/components/StatCard";
import { MessageSquare, CalendarCheck, Users, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Tin nhắn hôm nay" value="128" icon={<MessageSquare size={20} />} trend="+12%" />
        <StatCard title="Booking tháng này" value="24" icon={<CalendarCheck size={20} />} trend="+5%" />
        <StatCard title="Khách hàng mới" value="18" icon={<Users size={20} />} trend="+8%" />
        <StatCard title="Doanh thu" value="45.2M" icon={<TrendingUp size={20} />} trend="+15%" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Tin nhắn gần đây</h2>
          <p className="text-gray-400 text-sm">Đang tải...</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Booking sắp tới</h2>
          <p className="text-gray-400 text-sm">Đang tải...</p>
        </div>
      </div>
    </div>
  );
}
