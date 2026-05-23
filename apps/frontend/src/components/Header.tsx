"use client";

import { useAuth } from "@/lib/auth";
import { Bell, User } from "lucide-react";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-gray-800 border-b border-gray-700 h-14 flex items-center justify-between px-6">
      <h2 className="text-sm font-semibold text-gray-200">Admin Panel</h2>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white relative">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
            3
          </span>
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={14} />
          </div>
          <span>{user?.name || "Admin"}</span>
        </div>
      </div>
    </header>
  );
}
