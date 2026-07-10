"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

function wsUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return apiUrl.replace(/^http/, "ws") + "/ws/alerts";
}

/**
 * Subscribes to the live alerts feed. Returns the current connection
 * state and the most recent event, and calls onEvent(event, data) for
 * every message so callers can merge updates into their own state
 * (e.g. an alerts list) without this hook owning that state itself.
 */
export function useAlertsSocket(onEvent) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const socket = new ReconnectingWebSocket(wsUrl());
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
