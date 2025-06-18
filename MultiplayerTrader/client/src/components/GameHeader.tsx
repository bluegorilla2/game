import { Zap, DollarSign, Settings } from 'lucide-react';
import type { User, GameSession, PlayerState } from '@shared/schema';

interface GameHeaderProps {
  user: User;
  session: GameSession;
  playerState: PlayerState;
  onlinePlayers: User[];
}

export default function GameHeader({ user, session, playerState, onlinePlayers }: GameHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Game Title */}
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

          {/* Player Info */}
          <div className="flex items-center space-x-4">
            {/* Money Display */}
            <div className="flex items-center space-x-2 bg-emerald-100 px-3 py-1 rounded-full">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="font-mono font-semibold text-emerald-800">
                ${playerState.money.toLocaleString()}
              </span>
            </div>
            
            {/* Player Avatar */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            {/* Settings */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
