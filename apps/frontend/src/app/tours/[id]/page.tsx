"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface Tour {
  id: string;
  code: string;
  name: string;
  destination: string;
  duration: string;
  description: string;
  priceAdult: string;
  priceChild?: string;
  isActive: boolean;
  tags: string[];
}

export default function TourDetailPage() {
  const { id } = useParams();
  const [tour, setTour] = useState<Tour | null>(null);

  useEffect(() => {
    api.get(`/api/tours/${id}`).then((data) => setTour(data.tour)).catch(() => setTour(null));
  }, [id]);

  if (!tour) return <p className="text-gray-400">Đang tải...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{tour.name}</h1>
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><span className="text-gray-400 text-sm">Mã:</span> <span className="text-white">{tour.code}</span></div>
          <div><span className="text-gray-400 text-sm">Điểm đến:</span> <span className="text-white">{tour.destination}</span></div>
          <div><span className="text-gray-400 text-sm">Thời gian:</span> <span className="text-white">{tour.duration}</span></div>
          <div><span className="text-gray-400 text-sm">Giá người lớn:</span> <span className="text-white">{tour.priceAdult}</span></div>
        </div>
        <div><span className="text-gray-400 text-sm">Mô tả:</span> <p className="text-white mt-1">{tour.description}</p></div>
        <div className="flex gap-2">
          {tour.tags.map((tag) => (
            <span key={tag} className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
