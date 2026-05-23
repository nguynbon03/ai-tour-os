import axios from "axios";
import { env } from "../config/env";

const ZALO_OA_API = "https://openapi.zalo.me/v2.0/oa";
const ZALO_OA_MSG_API = "https://openapi.zalo.me/v2.0/oa/message";

function getHeaders() {
  return {
    access_token: env.ZALO_OA_ACCESS_TOKEN || "",
    "Content-Type": "application/json",
  };
}

export interface ZaloFollower {
  user_id: string;
  display_name: string;
  avatar?: string;
  user_id_by_app?: string;
}

export interface ZaloMessagePayload {
  recipient_id: string;
  message: {
    text?: string;
    attachment?: {
      type: string;
      payload: Record<string, unknown>;
    };
  };
}

export async function sendTextMessage(userId: string, text: string) {
  if (!env.ZALO_OA_ACCESS_TOKEN) throw new Error("ZALO_OA_ACCESS_TOKEN not configured");

  const res = await axios.post(
    ZALO_OA_MSG_API,
    {
      recipient: { user_id: userId },
      message: { text },
    },
    { headers: getHeaders() }
  );
  return res.data;
}

export async function getFollowers(offset = 0, count = 50) {
  if (!env.ZALO_OA_ACCESS_TOKEN) throw new Error("ZALO_OA_ACCESS_TOKEN not configured");

  const res = await axios.get(`${ZALO_OA_API}/getfollowers`, {
    headers: getHeaders(),
    params: { offset, count, data: "avatar,userid_by_app" },
  });
  return res.data;
}

export async function getOAInfo() {
  if (!env.ZALO_OA_ACCESS_TOKEN) throw new Error("ZALO_OA_ACCESS_TOKEN not configured");

  const res = await axios.get(`${ZALO_OA_API}/getoa`, {
    headers: getHeaders(),
  });
  return res.data;
}

export async function getUserProfile(userId: string) {
  if (!env.ZALO_OA_ACCESS_TOKEN) throw new Error("ZALO_OA_ACCESS_TOKEN not configured");

  const res = await axios.get(`${ZALO_OA_API}/getprofile`, {
    headers: getHeaders(),
    params: { user_id: userId },
  });
  return res.data;
}

export async function uploadImage(imageUrl: string) {
  if (!env.ZALO_OA_ACCESS_TOKEN) throw new Error("ZALO_OA_ACCESS_TOKEN not configured");

  const res = await axios.post(
    `${ZALO_OA_API}/upload/image`,
    { url: imageUrl },
    { headers: getHeaders() }
  );
  return res.data;
}
