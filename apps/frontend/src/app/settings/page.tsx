"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [zaloWebhook, setZaloWebhook] = useState("https://api-tour-ai.overpowers.agency/api/zalo/webhook");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>
      <div className="bg-gray-800 rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Zalo OA</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Webhook URL</label>
              <input
                type="text"
                value={zaloWebhook}
                readOnly
                className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Access Token</label>
              <input
                type="password"
                placeholder="Nhập Zalo OA Access Token"
                className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600"
              />
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <h2 className="text-lg font-semibold mb-3">AI Configuration</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">OpenAI API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Anthropic API Key</label>
              <input
                type="password"
                placeholder="sk-ant-..."
                className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600"
              />
            </div>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Lưu cài đặt</button>
      </div>
    </div>
  );
}
