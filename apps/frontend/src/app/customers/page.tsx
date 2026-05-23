"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { api } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  source: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  LEAD: "text-yellow-400",
  INTERESTED: "text-blue-400",
  QUOTED: "text-purple-400",
  BOOKED: "text-green-400",
  COMPLETED: "text-gray-400",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get("/api/customers")
      .then((data) => setCustomers(data.customers || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Đang tải...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý Khách hàng</h1>
      <DataTable
        columns={[
          { key: "name", header: "Tên" },
          { key: "phone", header: "SĐT" },
          { key: "email", header: "Email" },
          { key: "status", header: "Trạng thái", render: (r) => <span className={statusColors[r.status] || "text-gray-400"}>{r.status}</span> },
          { key: "source", header: "Nguồn" },
          { key: "createdAt", header: "Ngày tạo", render: (r) => new Date(r.createdAt).toLocaleDateString("vi-VN") },
        ]}
        data={customers}
        onRowClick={(row) => router.push(`/customers/${row.id}`)}
      />
    </div>
  );
}
