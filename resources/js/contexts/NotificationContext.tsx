import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NotificationContextType {
    unreadCount: number;
    setUnreadCount: (count: number) => void;
    refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    const refreshUnreadCount = async () => {
        try {
            // Check if route function is available (Laravel Ziggy)
            if (typeof route === 'undefined') {
                return;
            }

            const response = await fetch(route('notification.fetch'), {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                return;
            }

            const result = await response.json();
            const notifications = result.retrieved || [];
            
            // Count unread notifications
            const count = notifications.filter((notif: any) => notif.status !== 'read').length;
            setUnreadCount(count);
            
            if (!isInitialized) {
                setIsInitialized(true);
            }
        } catch (error) {
            // Silently fail on initial load
            if (isInitialized) {
                console.error('Error fetching notification count:', error);
            }
        }
    };

    useEffect(() => {
        // Delay initial fetch to ensure route is available
        const timer = setTimeout(() => {
            refreshUnreadCount();
        }, 100);

        // Poll every 30 seconds
        const interval = setInterval(refreshUnreadCount, 30000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refreshUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
