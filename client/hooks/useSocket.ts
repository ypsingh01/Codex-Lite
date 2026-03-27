"use client";

import { useEffect, useState } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<ReturnType<typeof getSocket>>(null);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    setSocket(s);
    setIsConnected(s.connected);
    s.on("connect", () => setIsConnected(true));
    s.on("disconnect", () => setIsConnected(false));
    return () => {
      s.off("connect");
      s.off("disconnect");
      disconnectSocket();
      setIsConnected(false);
      setSocket(null);
    };
  }, []);

  return { socket, isConnected };
}
