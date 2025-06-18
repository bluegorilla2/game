import { useState } from 'react';
import { Send } from 'lucide-react';
import type { ChatMessage, TradeOffer, User } from '@shared/schema';

interface ChatSidebarProps {
  chatMessages: (ChatMessage & { user: User })[];
  tradeOffers: TradeOffer[];
  currentUserId: number;
  onSendMessage: (message: string) => void;
  onAcceptTrade: (tradeId: number) => void;
  onDeclineTrade: (tradeId: number) => void;
}

export default function ChatSidebar({ 
  chatMessages, 
  tradeOffers, 
  currentUserId,
  onSendMessage, 
  onAcceptTrade, 
  onDeclineTrade 
}: ChatSidebarProps) {
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const pendingTrades = tradeOffers.filter(trade => 
    trade.status === 'pending' && trade.toUserId === currentUserId
  );

  return (
    <div className="lg:col-span-1 space-y-4">
      {/* Chat System */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-96">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Global Chat</h3>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          {chatMessages.map((message) => (
            <div key={message.id} className="animate-fade-in">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {message.user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline space-x-2">
                    <span className={`text-sm font-medium ${
                      message.userId === currentUserId ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {message.userId === currentUserId ? 'You' : message.user.username}
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
              onKeyPress={handleKeyPress}
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
                  onClick={() => onAcceptTrade(trade.id)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded font-medium transition-colors"
                >
                  Accept
                </button>
                <button 
                  onClick={() => onDeclineTrade(trade.id)}
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
  );
}
