"use client";

import { useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

function wsUrl(reference) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return (
    apiUrl.replace(/^https/, "wss").replace(/^http/, "ws") +
    `/ws/status/${reference}`
  );
}

export function useStatusSocket(reference, onStatusUpdate) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const callbackRef = useRef(onStatusUpdate);
  callbackRef.current = onStatusUpdate;

  useEffect(() => {
    if (!reference) return;

    const socket = new ReconnectingWebSocket(wsUrl(reference), [], {
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
        if (parsed.event === "STATUS_UPDATE") {
          callbackRef.current?.(parsed.data);
        }
      } catch {
        // ignore malformed frames
      }
    });

    return () => {
      socket.close();
    };
  }, [reference]);

  return { connected };
}
