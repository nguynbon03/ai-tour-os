"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: string;
  source: string;
  budget?: string;
  preferences?: string;
  birthday?: string;
  notes?: string;
}

interface Message {
  id: string;
  direction: string;
  content: string;
  createdAt: string;
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    api.get(`/api/customers/${id}`).then((data) => setCustomer(data.customer)).catch(() => setCustomer(null));
    api.get(`/api/messages?customerId=${id}`).then((data) => setMessages(data.messages || [])).catch(() => setMessages([]));
  }, [id]);

  if (!customer) return <p className="text-gray-400">Đang tải...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{customer.name}</h1>
      <div className="bg-gray-800 rounded-lg p-6 grid grid-cols-2 gap-4">
        <div><span className="text-gray-400 text-sm">SĐT:</span> <span className="text-white">{customer.phone || "N/A"}</span></div>
        <div><span className="text-gray-400 text-sm">Email:</span> <span className="text-white">{customer.email || "N/A"}</span></div>
        <div><span className="text-gray-400 text-sm">Trạng thái:</span> <span className="text-white">{customer.status}</span></div>
        <div><span className="text-gray-400 text-sm">Nguồn:</span> <span className="text-white">{customer.source}</span></div>
        <div><span className="text-gray-400 text-sm">Ngân sách:</span> <span className="text-white">{customer.budget || "N/A"}</span></div>
        <div><span className="text-gray-400 text-sm">Sở thích:</span> <span className="text-white">{customer.preferences || "N/A"}</span></div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Lịch sử chat</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`p-3 rounded ${msg.direction === "INBOUND" ? "bg-gray-700" : "bg-blue-900/30"}`}>
              <p className="text-sm text-gray-300">{msg.content}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(msg.createdAt).toLocaleString("vi-VN")}</p>
            </div>
          ))}
          {messages.length === 0 && <p className="text-gray-500 text-sm">Chưa có tin nhắn</p>}
        </div>
      </div>
    </div>
  );
}
