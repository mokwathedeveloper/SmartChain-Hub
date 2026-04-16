import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextType {
  addNotification: (message: string, type: Notification['type']) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: Notification['type']) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col space-y-4">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`px-6 py-4 rounded-2xl shadow-2xl animate-slide-up border flex items-center space-x-3 glass-dark text-white min-w-[300px] ${
              n.type === 'success' ? 'border-green-500/50' : 
              n.type === 'error' ? 'border-red-500/50' : 
              'border-electric-purple/50'
            }`}
          >
            <span className="text-xl">
              {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : '🔔'}
            </span>
            <p className="text-sm font-bold">{n.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
