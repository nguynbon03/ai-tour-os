"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Follower {
  user_id: string;
  display_name: string;
  avatar?: string;
}

export default function ZaloChatPage() {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [selectedUser, setSelectedUser] = useState<Follower | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/zalo/config").then((d) => {
      setConfigured(d.data?.configured);
      if (d.data?.configured) loadFollowers();
      else setLoading(false);
    });
  }, []);

  const loadFollowers = async () => {
    try {
      const data = await api.get("/api/zalo/followers");
      const list = data.data?.followers || data.data?.data?.followers || [];
      setFollowers(list);
    } catch {
      setFollowers([]);
    } finally {
      setLoading(false);
    }
  };

  const selectUser = async (user: Follower) => {
    setSelectedUser(user);
    try {
      const customers = await api.get(`/api/customers?zaloId=${user.user_id}`);
      if (customers.customers?.length) {
        const msgs = await api.get(`/api/messages?customerId=${customers.customers[0].id}`);
        setMessages(msgs.messages || []);
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!selectedUser || !input.trim()) return;
    try {
      await api.post("/api/zalo/send", {
        userId: selectedUser.user_id,
        text: input.trim(),
      });
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), direction: "OUTBOUND", content: input.trim(), createdAt: new Date().toISOString() },
      ]);
      setInput("");
    } catch (e: any) {
      alert("Gửi thất bại: " + e.message);
    }
  };

  if (!configured) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Zalo Chat</h1>
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-6">
          <p className="text-yellow-200">Chưa cấu hình Zalo OA Access Token.</p>
          <p className="text-gray-400 mt-2">Vui lòng vào Cài đặt để thêm token.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar: Followers */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-semibold">Zalo Followers</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && <p className="p-4 text-gray-400 text-sm">Đang tải...</p>}
          {followers.map((f) => (
            <button
              key={f.user_id}
              onClick={() => selectUser(f)}
              className={`w-full text-left p-3 flex items-center gap-3 hover:bg-gray-700 transition ${
                selectedUser?.user_id === f.user_id ? "bg-gray-700" : ""
              }`}
            >
              {f.avatar ? (
                <img src={f.avatar} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                  {f.display_name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.display_name}</p>
                <p className="text-xs text-gray-400 truncate">{f.user_id}</p>
              </div>
            </button>
          ))}
          {followers.length === 0 && !loading && (
            <p className="p-4 text-gray-500 text-sm">Không có followers</p>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-700 flex items-center gap-3">
              {selectedUser.avatar ? (
                <img src={selectedUser.avatar} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                  {selectedUser.display_name?.charAt(0) || "U"}
                </div>
              )}
              <span className="font-medium">{selectedUser.display_name}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.direction === "INBOUND"
                      ? "bg-gray-700 mr-auto"
                      : "bg-blue-600 ml-auto"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(msg.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-gray-500 text-sm mt-8">Chưa có tin nhắn</p>
              )}
            </div>

            <div className="p-4 border-t border-gray-700 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 p-2 bg-gray-800 rounded text-white border border-gray-600 focus:border-blue-500 outline-none"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
              >
                Gửi
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Chọn một người để bắt đầu chat
          </div>
        )}
      </div>
    </div>
  );
}
