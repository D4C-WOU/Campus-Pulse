"use client";

import { useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

function wsUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return apiUrl.replace(/^https/, "wss").replace(/^http/, "ws") + "/ws/alerts";
}

export function useAlertsSocket(onEvent) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const socket = new ReconnectingWebSocket(wsUrl(), [], {
      connectionTimeout: 10000,
      maxRetries: Infinity,
      maxReconnectionDelay: 5000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
    });
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setConnected(true);
    });

    socket.addEventListener("close", () => {
      setConnected(false);
    });

    socket.addEventListener("error", () => {
      setConnected(false);
    });

    socket.addEventListener("message", (msg) => {
      try {
        const parsed = JSON.parse(msg.data);
        // Server keepalive ping — respond with pong, don't pass to handler
        if (parsed.event === "ping") {
          socket.send(JSON.stringify({ event: "pong" }));
          return;
        }
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
