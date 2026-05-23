"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { api } from "@/lib/api";
import { MapPin, Plus } from "lucide-react";

interface Tour {
  id: string;
  code: string;
  name: string;
  destination: string;
  duration: string;
  priceAdult: string;
  isActive: boolean;
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get("/api/tours")
      .then((data) => setTours(data.tours || []))
      .catch(() => setTours([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Đang tải...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý Tour</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={16} /> Thêm tour
        </button>
      </div>
      <DataTable
        columns={[
          { key: "code", header: "Mã" },
          { key: "name", header: "Tên tour" },
          { key: "destination", header: "Điểm đến", render: (r) => <span className="flex items-center gap-1"><MapPin size={14} /> {r.destination}</span> },
          { key: "duration", header: "Thời gian" },
          { key: "priceAdult", header: "Giá người lớn" },
          { key: "isActive", header: "Trạng thái", render: (r) => <span className={r.isActive ? "text-green-400" : "text-red-400"}>{r.isActive ? "Active" : "Inactive"}</span> },
        ]}
        data={tours}
        onRowClick={(row) => router.push(`/tours/${row.id}`)}
      />
    </div>
  );
}
