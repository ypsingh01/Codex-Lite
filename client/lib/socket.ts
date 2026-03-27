import { io } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socketInstance: ReturnType<typeof io> | null = null;

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (socketInstance?.connected) return socketInstance;
  const token = useAuthStore.getState().getToken();
  socketInstance = io(socketUrl, {
    auth: { token: token ?? "" },
    transports: ["websocket", "polling"],
  });
  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
