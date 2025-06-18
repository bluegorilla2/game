import { useState, useEffect, useRef } from 'react';

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... attempt ${reconnectAttempts.current}`);
            connect();
          }, 1000 * Math.pow(2, reconnectAttempts.current));
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  const joinGame = (username: string, sessionName = 'Alpha-7') => {
    sendMessage({
      type: 'join',
      username,
      sessionName
    });
  };

  const sendChatMessage = (content: string) => {
    sendMessage({
      type: 'chat_message',
      content
    });
  };

  const sendGameAction = (action: string, data?: any) => {
    sendMessage({
      type: 'game_action',
      action,
      data
    });
  };

  const sendTradeOffer = (toUserId: number, offerItems: any, requestItems: any) => {
    sendMessage({
      type: 'trade_offer',
      toUserId,
      offerItems,
      requestItems
    });
  };

  const buyFromMarket = (listingId: number) => {
    sendMessage({
      type: 'buy_from_market',
      listingId
    });
  };

  return {
    socket,
    isConnected,
    sendMessage,
    joinGame,
    sendChatMessage,
    sendGameAction,
    sendTradeOffer,
    buyFromMarket
  };
}
