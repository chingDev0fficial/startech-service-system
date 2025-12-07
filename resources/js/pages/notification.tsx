import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useEffect, useState } from 'react';
import { Bell, Check, Clock, AlertTriangle, Info, CheckCircle, User, Calendar, Settings, Eye, X } from 'lucide-react';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifications',
        href: '#',
    },
];

// Helper function to format timestamp
const formatTimestamp = (createdAt: string): string => {
    const now = new Date();
    const notifDate = new Date(createdAt);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return notifDate.toLocaleDateString();
};

// Helper function to get icon based on notification type
const getIconByType = (type: string) => {
    switch (type.toLowerCase()) {
        case 'success':
            return CheckCircle;
        case 'warning':
            return AlertTriangle;
        case 'error':
            return AlertTriangle;
        case 'info':
            return Info;
        case 'appointment':
        case 'client_req':
            return Calendar;
        case 'technician_note':
            return Bell;
        case 'settings':
            return Settings;
        default:
            return Bell;
    }
};

export default function notification() {
    const { auth } = usePage<SharedData>().props;
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleFetchedNotif = async () => {
        try {
            const response = await fetch(route('notification.fetch'), {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.retrieved;

        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    };

    useEffect(() => {
        setIsLoading(true);
        
        handleFetchedNotif()
            .then(data => {
                if (data && Array.isArray(data)) {
                    const transform = data.map((notif: any) => ({
                        id: notif.id,
                        type: notif.type || 'info',
                        title: notif.title || 'Notification',
                        message: notif.message || '',
                        timestamp: notif.created_at ? formatTimestamp(notif.created_at) : 'Just now',
                        isRead: notif.status === 'read',
                        icon: getIconByType(notif.type || 'info')
                    }));

                    // Sort by ID in descending order to show newest first
                    const sortedNotifications = transform.sort((a: any, b: any) => b.id - a.id);
                    setNotifications(sortedNotifications);
                }
            })
            .catch(error => {
                console.error('Error fetching notifications:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });

        // Optional: Set up polling for new notifications if Echo is not available
        const pollInterval = setInterval(() => {
            handleFetchedNotif().then(data => {
                if (data && Array.isArray(data)) {
                    const transform = data.map((notif: any) => ({
                        id: notif.id,
                        type: notif.type || 'info',
                        title: notif.title || 'Notification',
                        message: notif.message || '',
                        timestamp: notif.created_at ? formatTimestamp(notif.created_at) : 'Just now',
                        isRead: notif.status === 'read',
                        icon: getIconByType(notif.type || 'info')
                    }));

                    setNotifications(transform.sort((a: any, b: any) => b.id - a.id));
                }
            });
        }, 30000); // Poll every 30 seconds

        // Cleanup function
        return () => {
            clearInterval(pollInterval);
        };
    }, []);

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;

        // Optimistically update UI
        const originalNotifications = notifications;
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            const response = await fetch(route('notification.markAllAsRead'), {
                method: 'POST',
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                // Revert if backend operation failed
                setNotifications(originalNotifications);
            }

        } catch (error) {
            console.error('Error marking all as read:', error);
            // Revert on error
            setNotifications(originalNotifications);
            alert('Failed to mark all notifications as read. Please try again.');
        }
    };

    const clearAllNotifications = async () => {
        if (notifications.length === 0) return;

        if (!confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
            return;
        }

        // Optimistically update UI
        const originalNotifications = notifications;
        setNotifications([]);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            const response = await fetch(route('notification.clearAll'), {
                method: 'POST',
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                // Revert if backend operation failed
                setNotifications(originalNotifications);
                alert('Failed to clear all notifications. Please try again.');
            }

        } catch (error) {
            console.error('Error clearing all notifications:', error);
            // Revert on error
            setNotifications(originalNotifications);
            alert('Failed to clear all notifications. Please try again.');
        }
    };

    const markAsRead = async (id: number) => {
        // Optimistically update UI
        const originalNotifications = notifications;
        setNotifications(prev =>
            prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
        );

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            const response = await fetch(route('notification.markAsRead'), {
                method: 'POST',
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                // Revert if backend operation failed
                setNotifications(originalNotifications);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert on error
            setNotifications(originalNotifications);
        }
    };

    const removeNotification = async (id: number) => {
        // Optimistically remove from UI
        const originalNotifications = notifications;
        setNotifications(prev => prev.filter(notif => notif.id !== id));

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            const response = await fetch(route('notification.clear'), {
                method: 'POST',
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                // Revert if backend operation failed
                setNotifications(originalNotifications);
            }
        } catch (error) {
            console.error('Error removing notification:', error);
            // Revert on error
            setNotifications(originalNotifications);
        }
    };

    const unreadCount = notifications.filter(notif => !notif.isRead).length;

    const getNotificationStyle = (type: string) => {
        switch (type.toLowerCase()) {
            case 'success':
                return 'border-l-green-500 bg-green-50';
            case 'warning':
                return 'border-l-yellow-500 bg-yellow-50';
            case 'error':
                return 'border-l-red-500 bg-red-50';
            case 'technician_note':
                return 'border-l-purple-500 bg-purple-50';
            case 'client_req':
                return 'border-l-indigo-500 bg-indigo-50';
            case 'info':
            default:
                return 'border-l-blue-500 bg-blue-50';
        }
    };

    const getIconStyle = (type: string) => {
        switch (type.toLowerCase()) {
            case 'success':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            case 'error':
                return 'text-red-600';
            case 'technician_note':
                return 'text-purple-600';
            case 'client_req':
                return 'text-indigo-600';
            case 'info':
            default:
                return 'text-blue-600';
        }
    };

    return (
        <>
            <Head title="Notifications" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="min-h-screen bg-gray-50 p-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Header */}
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center space-x-3">
                                    <Bell className="w-8 h-8 text-blue-600" />
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                                        <p className="text-gray-600">
                                            {isLoading ? 'Loading...' : unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All notifications read'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={markAllAsRead}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                                        disabled={unreadCount === 0 || isLoading}
                                        title="Mark all notifications as read"
                                    >
                                        <Check className="w-4 h-4" />
                                        <span className="hidden sm:inline">Mark All Read</span>
                                    </button>
                                    <button
                                        onClick={clearAllNotifications}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                                        disabled={notifications.length === 0 || isLoading}
                                        title="Clear all notifications"
                                    >
                                        <X className="w-4 h-4" />
                                        <span className="hidden sm:inline">Clear All</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading ? (
                            <div className="bg-white rounded-lg shadow-sm p-12">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                    <p className="text-gray-500">Loading notifications...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Notifications List */}
                                <div className="bg-white rounded-lg shadow-sm">
                                    {notifications.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                                            <p className="text-gray-500">You're all caught up! Check back later for new notifications.</p>
                                        </div>
                                    ) : (
                                <div className="divide-y divide-gray-200">
                                    {notifications.map((notification) => {
                                        const IconComponent = notification.icon;
                                        return (
                                            <div
                                                key={notification.id}
                                                className={`p-6 border-l-4 ${getNotificationStyle(notification.type)} ${
                                                    !notification.isRead ? 'bg-blue-50' : 'bg-white'
                                                } hover:bg-gray-50 transition-colors`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-4">
                                                        <div className={`flex-shrink-0 ${getIconStyle(notification.type)}`}>
                                                            <IconComponent className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <h4 className="text-sm font-medium text-gray-900">
                                                                    {notification.title}
                                                                </h4>
                                                                {!notification.isRead && (
                                                                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-700 mb-2">
                                                                {notification.message}
                                                            </p>
                                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                                <span className="flex items-center space-x-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span>{notification.timestamp}</span>
                                                                </span>
                                                                {notification.isRead && (
                                                                    <span className="flex items-center space-x-1 text-green-600">
                                                                        <Check className="w-3 h-3" />
                                                                        <span>Read</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                                title="Mark as read"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => removeNotification(notification.id)}
                                                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                            title="Remove notification"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                            </>
                        )}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
