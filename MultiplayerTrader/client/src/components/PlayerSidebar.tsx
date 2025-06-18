import type { User, GameActivity } from '@shared/schema';

interface PlayerSidebarProps {
  onlinePlayers: User[];
  recentActivities: (GameActivity & { user: User })[];
}

export default function PlayerSidebar({ onlinePlayers, recentActivities }: PlayerSidebarProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1m ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return '1d+ ago';
  };

  return (
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
            <div key={activity.id} className="flex items-start space-x-2 p-2 text-xs animate-fade-in">
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
  );
}
