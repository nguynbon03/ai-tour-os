"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, CalendarCheck, Users, BarChart3, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/tours", label: "Tour", icon: <MapPin size={18} /> },
  { href: "/bookings", label: "Booking", icon: <CalendarCheck size={18} /> },
  { href: "/customers", label: "Khách hàng", icon: <Users size={18} /> },
  { href: "/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
  { href: "/settings", label: "Cài đặt", icon: <Settings size={18} /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white">AI Tour OS</h2>
        <p className="text-xs text-gray-500">Autonomous Tour System</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded text-sm transition",
              pathname === item.href
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 text-gray-400 hover:text-white text-sm w-full"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
