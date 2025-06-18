import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Package, Hammer, ShoppingCart, Users, Zap, Plus, Minus, Beaker, Sparkles, Trash2, Send, X, DollarSign, Settings, CheckCircle, Star, AlertCircle, Info } from 'lucide-react';

// Types
interface User {
  id: number;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface GameSession {
  id: number;
  name: string;
  maxPlayers: number;
  createdAt: Date;
}

interface PlayerState {
  id: number;
  userId: number;
  sessionId: number;
  money: number;
  clickPower: number;
  materials: Record<string, number>;
  unlockedMaterials: string[];
  discoveredItems: Record<string, any>;
  craftedItems: Record<string, number>;
  totalDiscoveries: number;
}

interface MarketListing {
  id: number;
  sellerId: number;
  sessionId: number;
  itemKey: string;
  itemName: string;
  itemValue: number;
  price: number;
  materials: Record<string, number>;
  createdAt: Date;
  seller: User;
}

interface TradeOffer {
  id: number;
  fromUserId: number;
  toUserId: number;
  sessionId: number;
  offerItems: Record<string, number>;
  requestItems: Record<string, number>;
  status: string;
  createdAt: Date;
}

interface ChatMessage {
  id: number;
  userId: number;
  sessionId: number;
  message: string;
  createdAt: Date;
  user: User;
}

interface GameActivity {
  id: number;
  userId: number;
  sessionId: number;
  type: string;
  description: string;
  createdAt: Date;
  user: User;
}

interface GameNotification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'unlock';
  timestamp: Date;
}

// Material Data
const materialData = {
  hydrogen: { price: 3, tier: 1, color: 'blue' },
  helium: { price: 5, tier: 1, color: 'purple' },
  lithium: { price: 8, tier: 1, color: 'pink' },
  carbon: { price: 4, tier: 1, color: 'gray' },
  nitrogen: { price: 6, tier: 1, color: 'cyan' },
  oxygen: { price: 4, tier: 1, color: 'red' },
  fluorine: { price: 10, tier: 1, color: 'green' },
  sodium: { price: 15, tier: 2, color: 'yellow' },
  magnesium: { price: 20, tier: 2, color: 'white' },
  aluminum: { price: 25, tier: 2, color: 'silver' },
  silicon: { price: 30, tier: 2, color: 'blue' },
  phosphorus: { price: 35, tier: 2, color: 'orange' },
  sulfur: { price: 28, tier: 2, color: 'yellow' },
  chlorine: { price: 32, tier: 2, color: 'green' },
  potassium: { price: 45, tier: 3, color: 'purple' },
  calcium: { price: 50, tier: 3, color: 'white' },
  iron: { price: 60, tier: 3, color: 'gray' },
  copper: { price: 70, tier: 3, color: 'orange' },
  zinc: { price: 80, tier: 3, color: 'blue' },
  silver: { price: 150, tier: 4, color: 'silver' },
  gold: { price: 300, tier: 4, color: 'yellow' },
  mercury: { price: 200, tier: 4, color: 'silver' },
  lead: { price: 120, tier: 4, color: 'gray' },
  uranium: { price: 500, tier: 4, color: 'green' },
  water: { price: 50, tier: 5, color: 'blue' },
  oil: { price: 100, tier: 5, color: 'black' },
  acid: { price: 150, tier: 5, color: 'green' },
  crystal: { price: 400, tier: 5, color: 'purple' },
  plasma: { price: 800, tier: 5, color: 'orange' },
  antimatter: { price: 2000, tier: 6, color: 'purple' },
  darkMatter: { price: 3000, tier: 6, color: 'black' },
  quantumFoam: { price: 5000, tier: 6, color: 'cyan' },
  strangeMatter: { price: 4000, tier: 6, color: 'red' },
  neutronium: { price: 6000, tier: 6, color: 'white' },
  photons: { price: 1000, tier: 7, color: 'yellow' },
  gravitons: { price: 8000, tier: 7, color: 'purple' },
  tachyons: { price: 10000, tier: 7, color: 'blue' },
  quarks: { price: 7000, tier: 7, color: 'red' },
  bosons: { price: 9000, tier: 7, color: 'green' },
  neutrinos: { price: 12000, tier: 7, color: 'white' }
} as const;

// WebSocket Hook
function useWebSocket() {
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

// Game State Hook
function useGameState(socket: WebSocket | null) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<User[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [recentActivities, setRecentActivities] = useState<GameActivity[]>([]);
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

// Notification System Component
function NotificationSystem({ notifications, onClearNotification }: { notifications: GameNotification[], onClearNotification: (id: number) => void }) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'unlock': return Star;
      case 'error': return AlertCircle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'unlock': return 'bg-purple-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = getNotificationIcon(notification.type);
        const colorClass = getNotificationColor(notification.type);
        
        return (
          <div
            key={notification.id}
            className={`${colorClass} text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up max-w-sm`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
              <button 
                onClick={() => onClearNotification(notification.id)}
                className="ml-2 text-white hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Main Trading Game Component
const TradingGame = () => {
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('clicker');
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, number>>({});
  const [messageInput, setMessageInput] = useState('');

  const { 
    socket, 
    isConnected, 
    joinGame,
    sendChatMessage,
    sendGameAction,
    sendTradeOffer,
    buyFromMarket
  } = useWebSocket();

  const {
    user,
    session,
    playerState,
    onlinePlayers,
    chatMessages,
    marketListings,
    recentActivities,
    notifications,
    tradeOffers,
    clearNotification
  } = useGameState(socket);

  const handleJoinGame = () => {
    if (username.trim()) {
      joinGame(username.trim());
      setIsJoined(true);
    }
  };

  // Helper functions
  const getUpgradeCost = () => playerState ? Math.floor(10 * Math.pow(1.5, playerState.clickPower - 1)) : 0;
  
  const materials = playerState?.materials as Record<string, number> || {};
  const craftedItems = playerState?.craftedItems as Record<string, number> || {};
  const discoveredItems = playerState?.discoveredItems as Record<string, any> || {};

  const toggleMaterial = (material: string, amount = 1) => {
    setSelectedMaterials(prev => {
      const current = prev[material] || 0;
      const available = materials[material] || 0;
      
      if (current + amount > available) return prev;
      if (current + amount < 0) {
        const { [material]: _, ...rest } = prev;
        return rest;
      }
      
      if (current + amount === 0) {
        const { [material]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [material]: current + amount };
    });
  };

  const calculateCombinationValue = (mats: Record<string, number>) => {
    const entries = Object.entries(mats);
    if (entries.length === 0) return 0;
    
    let totalValue = 0;
    let totalTier = 0;
    let complexity = entries.length;
    
    entries.forEach(([mat, qty]) => {
      if (materialData[mat as keyof typeof materialData]) {
        const data = materialData[mat as keyof typeof materialData];
        totalValue += data.price * qty;
        totalTier += data.tier * qty;
      }
    });
    
    const avgTier = totalTier / entries.reduce((sum, [_, qty]) => sum + qty, 0);
    const complexityBonus = Math.pow(1.3, complexity - 1);
    const tierBonus = Math.pow(1.2, avgTier - 1);
    
    return Math.floor(totalValue * complexityBonus * tierBonus);
  };

  const generateItemName = (mats: Record<string, number>) => {
    const entries = Object.entries(mats).sort((a, b) => b[1] - a[1]);
    
    if (mats.hydrogen && mats.oxygen && entries.length === 2) return "Pure Water";
    if (mats.carbon && mats.iron && entries.length === 2) return "Steel";
    if (mats.copper && mats.zinc && entries.length === 2) return "Brass";
    if (mats.gold && mats.silver && entries.length === 2) return "Electrum";
    
    const prefixes = ['Refined', 'Pure', 'Enriched', 'Stabilized', 'Quantum', 'Exotic'];
    const suffixes = ['Compound', 'Alloy', 'Crystal', 'Matrix', 'Composite', 'Element'];
    
    const mainMat = entries[0][0];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix} ${mainMat.charAt(0).toUpperCase() + mainMat.slice(1)} ${suffix}`;
  };

  const craftWithSelection = () => {
    if (Object.keys(selectedMaterials).length === 0) return;
    
    const itemName = generateItemName(selectedMaterials);
    const itemValue = calculateCombinationValue(selectedMaterials);
    
    sendGameAction('craft_item', {
      selectedMaterials,
      itemName,
      itemValue
    });
    
    setSelectedMaterials({});
  };

  const sellItem = (itemKey: string) => {
    const item = discoveredItems[itemKey];
    if (!item || !craftedItems[itemKey] || craftedItems[itemKey] <= 0) return;
    
    const variance = 0.3;
    const price = Math.floor(item.value * (1 + (Math.random() - 0.5) * variance));
    
    sendGameAction('sell_to_market', {
      itemKey,
      itemName: item.name,
      itemValue: item.value,
      materials: item.materials,
      price
    });
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendChatMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1m ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    return diffHours < 24 ? `${diffHours}h ago` : '1d+ ago';
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Join Screen
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Material Trader</h1>
            <p className="text-gray-600 mt-2">Join the multiplayer trading game</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose your username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                placeholder="Enter username..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={20}
              />
            </div>
            
            <button
              onClick={handleJoinGame}
              disabled={!username.trim() || !isConnected}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isConnected ? 'Join Game' : 'Connecting...'}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (!user || !session || !playerState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  const pendingTrades = tradeOffers.filter(trade => 
    trade.status === 'pending' && trade.toUserId === user.id
  );

  // Main Game Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Material Trader</h1>
              </div>
              
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Room: {session.name}</span>
                <span className="text-xs text-green-600">{onlinePlayers.length} players</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-emerald-100 px-3 py-1 rounded-full">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="font-mono font-semibold text-emerald-800">
                  ${playerState.money.toLocaleString()}
                </span>
              </div>
              
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          
          {/* Players Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Online Players */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Online Players</h3>
                  <span className="text-xs text-gray-500">{onlinePlayers.length}</span>
                </div>
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                {onlinePlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${
                        player.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      } border border-white rounded-full`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{player.username}</p>
                      <p className="text-xs text-gray-500">
                        {player.isOnline ? 'Online' : formatTimeAgo(player.lastSeen!)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {onlinePlayers.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No other players online
                  </div>
                )}
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Live Activity</h3>
              </div>
              <div className="p-2 max-h-48 overflow-y-auto">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-2 p-2 text-xs">
                    <div className={`w-2 h-2 ${
                      activity.type === 'discovery' ? 'bg-purple-500' :
                      activity.type === 'sale' ? 'bg-green-500' :
                      activity.type === 'purchase' ? 'bg-blue-500' :
                      'bg-gray-500'
                    } rounded-full mt-1.5 flex-shrink-0`}></div>
                    <div>
                      <span className="font-medium text-gray-900">{activity.user.username}</span>
                      <span className="text-gray-600"> {activity.description}</span>
                      <div className="text-gray-400">{formatTimeAgo(activity.createdAt!)}</div>
                    </div>
                  </div>
                ))}
                
                {recentActivities.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Game Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'clicker', label: 'Clicker', icon: Zap },
                  { id: 'materials', label: 'Materials', icon: Package },
                  { id: 'crafting', label: 'Crafting', icon: Hammer },
                  { id: 'market', label: 'Market', icon: TrendingUp }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === id
                        ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 inline mr-2" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Clicker Tab */}
                {activeTab === 'clicker' && (
                  <div className="text-center space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Money</h2>
                      <p className="text-gray-600">Click the button to earn money for trading</p>
                    </div>
                    
                    <div className="flex justify-center">
                      <button
                        onClick={() => sendGameAction('click_money')}
                        className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center group"
                      >
                        <div className="text-center">
                          <DollarSign className="w-8 h-8 mx-auto mb-1 group-active:scale-90 transition-transform" />
                          <div className="text-sm font-medium">Click Me!</div>
                        </div>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold font-mono text-emerald-600">
                          ${playerState.clickPower}
                        </div>
                        <div className="text-sm text-emerald-600">Per Click</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold font-mono text-blue-600">
                          {playerState.totalDiscoveries}
                        </div>
                        <div className="text-sm text-blue-600">Discoveries</div>
                      </div>
                    </div>

                    <button
                      onClick={() => sendGameAction('upgrade_click')}
                      disabled={playerState.money < getUpgradeCost()}
                      className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      <TrendingUp className="w-5 h-5 inline mr-2" />
                      Upgrade Click Power - <span className="font-mono">${getUpgradeCost()}</span>
                    </button>
                  </div>
                )}

                {/* Materials Tab */}
                {activeTab === 'materials' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Buy Materials</h2>
                      <p className="text-gray-600">Purchase raw materials for crafting</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Elements</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.entries(materialData).filter(([_, data]) => data.tier <= 2).map(([material, data]) => (
                            <div
                              key={material}
                              className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center hover:bg-blue-100 transition-colors"
                            >
                              <div className="font-medium text-blue-800 mb-1">
                                {material.charAt(0).toUpperCase() + material.slice(1)}
                              </div>
                              <div className="text-xs text-blue-600 mb-2">
                                Owned: {materials[material] || 0}
                              </div>
                              <button
                                onClick={() => sendGameAction('buy_material', { material })}
                                disabled={playerState.money < data.price}
                                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm py-1 px-2 rounded font-medium transition-colors"
                              >
                                Buy - <span className="font-mono">${data.price}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Advanced Materials</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.entries(materialData).filter(([_, data]) => data.tier > 2).map(([material, data]) => (
                            <div
                              key={material}
                              className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center hover:bg-purple-100 transition-colors"
                            >
                              <div className="font-medium text-purple-800 mb-1">
                                {material.charAt(0).toUpperCase() + material.slice(1)}
                              </div>
                              <div className="text-xs text-purple-600 mb-2">
                                Owned: {materials[material] || 0}
                              </div>
                              <button
                                onClick={() => sendGameAction('buy_material', { material })}
                                disabled={playerState.money < data.price}
                                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white text-sm py-1 px-2 rounded font-medium transition-colors"
                              >
                                Buy - <span className="font-mono">${data.price}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Crafting Tab */}
                {activeTab === 'crafting' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Craft Items</h2>
                      <p className="text-gray-600">Combine materials to create valuable items</p>
                    </div>

                    {/* Selected Materials */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">Selected Materials</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                        {Object.entries(selectedMaterials).map(([material, quantity]) => (
                          <div key={material} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm text-center">
                            {material} x{quantity}
                            <button 
                              onClick={() => toggleMaterial(material, -quantity)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        
                        {Object.keys(selectedMaterials).length === 0 && (
                          <div className="col-span-full text-center text-gray-500 text-sm py-2">
                            No materials selected
                          </div>
                        )}
                      </div>
                      <button
                        onClick={craftWithSelection}
                        disabled={Object.keys(selectedMaterials).length === 0}
                        className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        Craft Item
                      </button>
                    </div>

                    {/* Available Materials */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Your Materials</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(materials).filter(([_, qty]) => qty > 0).map(([material, quantity]) => (
                          <div key={material} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-800">
                                {material.charAt(0).toUpperCase() + material.slice(1)}
                              </span>
                              <span className="text-sm text-gray-500">x{quantity}</span>
                            </div>
                            <div className="flex space-x-1">
                              <button 
                                onClick={() => toggleMaterial(material, 1)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1 px-2 rounded transition-colors"
                              >
                                +1
                              </button>
                              <button 
                                onClick={() => toggleMaterial(material, 5)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1 px-2 rounded transition-colors"
                              >
                                +5
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {Object.entries(materials).filter(([_, qty]) => qty > 0).length === 0 && (
                          <div className="col-span-full text-center text-gray-500 text-sm py-4">
                            No materials available. Buy some materials first!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inventory */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Your Items</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(craftedItems).filter(([_, qty]) => qty > 0).map(([itemKey, quantity]) => {
                          const item = discoveredItems[itemKey];
                          return (
                            <div key={itemKey} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-800">{item?.name || 'Unknown Item'}</span>
                                <span className="text-sm text-gray-500">x{quantity}</span>
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                Value: ${item?.value || 0}
                              </div>
                              <button 
                                onClick={() => sellItem(itemKey)}
                                className="w-full bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded font-medium transition-colors"
                              >
                                Sell to Market
                              </button>
                            </div>
                          );
                        })}
                        
                        {Object.entries(craftedItems).filter(([_, qty]) => qty > 0).length === 0 && (
                          <div className="col-span-full text-center text-gray-500 text-sm py-4">
                            No crafted items. Try crafting something!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Market Tab */}
                {activeTab === 'market' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Market</h2>
                        <p className="text-gray-600">Buy and sell items with other players</p>
                      </div>
                      <button
                        onClick={() => setShowTradeModal(true)}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        <Users className="w-4 h-4 inline mr-2" />
                        Direct Trade
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {marketListings.map((listing) => (
                        <div key={listing.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{listing.itemName}</h3>
                              <p className="text-sm text-gray-600">by {listing.seller.username}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">${listing.price}</div>
                              <div className="text-xs text-gray-500">Value: ${listing.itemValue}</div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-3">
                            Materials: {Object.entries(listing.materials).map(([mat, qty]) => 
                              `${mat} x${qty}`
                            ).join(', ')}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(listing.createdAt)}
                            </span>
                            <button
                              onClick={() => buyFromMarket(listing.id)}
                              disabled={playerState.money < listing.price || listing.sellerId === user.id}
                              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm py-1 px-3 rounded font-medium transition-colors"
                            >
                              {listing.sellerId === user.id ? 'Your Item' : 'Buy'}
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {marketListings.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 text-sm py-8">
                          No items for sale. Be the first to list something!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chat Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Chat System */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-96">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Global Chat</h3>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id}>
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {message.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline space-x-2">
                          <span className={`text-sm font-medium ${
                            message.userId === user.id ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {message.userId === user.id ? 'You' : message.user.username}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(message.createdAt!)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 break-words">{message.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-4">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="border-t border-gray-200 p-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={200}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Trades */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Trade Offers</h3>
                  {pendingTrades.length > 0 && (
                    <span className="text-xs text-amber-600">{pendingTrades.length} pending</span>
                  )}
                </div>
              </div>
              <div className="p-3 space-y-3">
                {pendingTrades.map((trade) => (
                  <div key={trade.id} className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          T
                        </div>
                        <span className="text-sm font-medium text-amber-800">Trade Offer</span>
                      </div>
                      <span className="text-xs text-amber-600">{trade.status}</span>
                    </div>
                    <div className="text-xs text-amber-700 mb-2">
                      <div>They offer: <span className="font-medium">
                        {Object.entries(trade.offerItems as Record<string, number>).map(([item, qty]) => 
                          `${item} x${qty}`
                        ).join(', ')}
                      </span></div>
                      <div>For your: <span className="font-medium">
                        {Object.entries(trade.requestItems as Record<string, number>).map(([item, qty]) => 
                          `${item} x${qty}`
                        ).join(', ')}
                      </span></div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => console.log('Accept trade:', trade.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded font-medium transition-colors"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => console.log('Decline trade:', trade.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded font-medium transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
                
                {pendingTrades.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-4">
                    No pending trade offers
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Direct Trade</h2>
                <button 
                  onClick={() => setShowTradeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center text-gray-500 py-8">
                Trade modal implementation would go here...
                <br />
                <button 
                  onClick={() => setShowTradeModal(false)}
                  className="mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <NotificationSystem 
        notifications={notifications}
        onClearNotification={clearNotification}
      />

      <style jsx>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes slideUp {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TradingGame;