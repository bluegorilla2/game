import { CheckCircle, Star, AlertCircle, Info, X } from 'lucide-react';

interface GameNotification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'unlock';
  timestamp: Date;
}

interface NotificationSystemProps {
  notifications: GameNotification[];
  onClearNotification: (id: number) => void;
}

export default function NotificationSystem({ notifications, onClearNotification }: NotificationSystemProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'unlock':
        return Star;
      case 'error':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'unlock':
        return 'bg-purple-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
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
