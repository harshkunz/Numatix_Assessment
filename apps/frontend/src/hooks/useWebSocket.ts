'use client';

import { useEffect, useState } from 'react';

export type WsPayload = {
  type: string;
  data: any;
};

export const useWebSocket = (url: string) => {
  const [lastMessage, setLastMessage] = useState<WsPayload | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token for WebSocket, skipping connection');
      return;
    }

    const socket = new WebSocket(`${url}?token=${token}`);

    socket.onopen = () => {
      console.log('WS OPEN');
      setReadyState(socket.readyState);
    };

    socket.onmessage = (event) => {
      //console.log('WS MESSAGE', event.data);
      try {
        const msg = JSON.parse(event.data) as WsPayload;
        setLastMessage(msg);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = (e) => {
      console.log('WS CLOSE', e.code, e.reason || '');
      setReadyState(socket.readyState);
    };

    socket.onerror = (e) => {
      console.log('WS ERROR', e);
      setReadyState(socket.readyState);
    };

    return () => {
      console.log('WS CLEANUP');
      socket.close();
    };
  }, [url]);

  return { lastMessage, readyState };
};
