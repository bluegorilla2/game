import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useGameState } from "@/hooks/useGameState";
import GameHeader from "@/components/GameHeader";
import PlayerSidebar from "@/components/PlayerSidebar";
import GameMainPanel from "@/components/GameMainPanel";
import ChatSidebar from "@/components/ChatSidebar";
import TradeModal from "@/components/TradeModal";
import NotificationSystem from "@/components/NotificationSystem";

export default function GamePage() {
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);

  const { 
    socket, 
    isConnected, 
    sendMessage,
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
    addNotification,
    clearNotification
  } = useGameState(socket);

  const handleJoinGame = () => {
    if (username.trim()) {
      joinGame(username.trim());
      setIsJoined(true);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <GameHeader 
        user={user}
        session={session}
        playerState={playerState}
        onlinePlayers={onlinePlayers}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          <PlayerSidebar 
            onlinePlayers={onlinePlayers}
            recentActivities={recentActivities}
          />
          
          <GameMainPanel 
            playerState={playerState}
            marketListings={marketListings}
            onGameAction={sendGameAction}
            onSellToMarket={(itemData) => sendGameAction('sell_to_market', itemData)}
            onBuyFromMarket={buyFromMarket}
            onOpenDirectTrade={() => setShowTradeModal(true)}
          />
          
          <ChatSidebar 
            chatMessages={chatMessages}
            tradeOffers={tradeOffers}
            currentUserId={user.id}
            onSendMessage={sendChatMessage}
            onAcceptTrade={(tradeId) => console.log('Accept trade:', tradeId)}
            onDeclineTrade={(tradeId) => console.log('Decline trade:', tradeId)}
          />
        </div>
      </div>

      {showTradeModal && (
        <TradeModal
          onlinePlayers={onlinePlayers.filter(p => p.id !== user.id)}
          playerState={playerState}
          onClose={() => setShowTradeModal(false)}
          onSendTradeOffer={sendTradeOffer}
        />
      )}

      <NotificationSystem 
        notifications={notifications}
        onClearNotification={clearNotification}
      />
    </div>
  );
}
