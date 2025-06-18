import { useState, useEffect } from 'react';
import type { User, GameSession, PlayerState, MarketListing, ChatMessage, GameActivity, TradeOffer } from '@shared/schema';

interface GameNotification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'unlock';
  timestamp: Date;
}

export function useGameState(socket: WebSocket | null) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<User[]>([]);
  const [chatMessages, setChatMessages] = useState<(ChatMessage & { user: User })[]>([]);
  const [marketListings, setMarketListings] = useState<(MarketListing & { seller: User })[]>([]);
  const [recentActivities, setRecentActivities] = useState<(GameActivity & { user: User })[]>([]);
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);

  const addNotification = (message: string, type: GameNotification['type'] = 'info') => {
    const id = Date.now();
    const notification: GameNotification = {
      id,
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const clearNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'joined':
            setUser(message.user);
            setSession(message.session);
            setPlayerState(message.playerState);
            setOnlinePlayers(message.onlinePlayers);
            setChatMessages(message.chatMessages);
            setMarketListings(message.marketListings);
            setRecentActivities(message.recentActivities);
            addNotification(`Welcome to ${message.session.name}!`, 'success');
            break;

          case 'player_joined':
            setOnlinePlayers(message.onlinePlayers);
            addNotification(`${message.user.username} joined the game`, 'info');
            break;

          case 'player_left':
            setOnlinePlayers(message.onlinePlayers);
            break;

          case 'new_chat_message':
            setChatMessages(prev => [...prev, message.message]);
            break;

          case 'state_update':
            setPlayerState(message.playerState);
            break;

          case 'market_update':
            setMarketListings(message.marketListings);
            break;

          case 'new_activity':
            setRecentActivities(prev => [message.activity, ...prev.slice(0, 19)]);
            break;

          case 'trade_offer_received':
            setTradeOffers(prev => [...prev, message.offer]);
            addNotification(`${message.fromUser.username} sent you a trade offer!`, 'info');
            break;

          case 'item_sold':
            addNotification(`${message.itemName} sold for $${message.price} to ${message.buyer.username}!`, 'success');
            break;

          case 'error':
            addNotification(message.message, 'error');
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  return {
    user,
    session,
    playerState,
    onlinePlayers,
    chatMessages,
    marketListings,
    recentActivities,
    notifications,
    tradeOffers,
    addNotification,
    clearNotification
  };
}
