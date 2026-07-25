"use client";

import { useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

function wsUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  // Replace http:// with ws:// and https:// with wss://
  // This is critical for production (Render uses HTTPS -> WSS)
  return apiUrl.replace(/^https/, "wss").replace(/^http/, "ws") + "/ws/alerts";
}

export function useAlertsSocket(onEvent) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const socket = new ReconnectingWebSocket(wsUrl(), [], {
      // Increase timeouts for Render's cold starts / proxy latency
      connectionTimeout: 10000,
      maxRetries: Infinity,
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 2000,
      reconnectionDelayGrowFactor: 1.3,
    });
    socketRef.current = socket;

    socket.addEventListener("open", () => setConnected(true));
    socket.addEventListener("close", () => setConnected(false));
    socket.addEventListener("error", () => setConnected(false));

    socket.addEventListener("message", (msg) => {
      try {
        const parsed = JSON.parse(msg.data);
        onEventRef.current?.(parsed.event, parsed.data);
      } catch {
        // ignore malformed frames
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  return { connected };
}
