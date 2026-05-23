"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { api } from "@/lib/api";

interface Booking {
  id: string;
  code: string;
  customerName: string;
  tourName: string;
  status: string;
  totalPrice: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: "text-yellow-400",
  CONFIRMED: "text-blue-400",
  DEPOSIT_PAID: "text-purple-400",
  FULLY_PAID: "text-green-400",
  CANCELLED: "text-red-400",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/bookings")
      .then((data) => setBookings(data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Đang tải...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý Booking</h1>
      <DataTable
        columns={[
          { key: "code", header: "Mã" },
          { key: "customerName", header: "Khách hàng" },
          { key: "tourName", header: "Tour" },
          { key: "status", header: "Trạng thái", render: (r) => <span className={statusColors[r.status] || "text-gray-400"}>{r.status}</span> },
          { key: "totalPrice", header: "Tổng giá" },
          { key: "createdAt", header: "Ngày tạo", render: (r) => new Date(r.createdAt).toLocaleDateString("vi-VN") },
        ]}
        data={bookings}
      />
    </div>
  );
}
