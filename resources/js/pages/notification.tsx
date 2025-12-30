import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { AlertTriangle, Bell, Calendar, Check, CheckCircle, Clock, Info, Settings, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        case 'rating_submitted':
            return Star;
        case 'settings':
            return Settings;
        default:
            return Bell;
    }
};

// Helper function to transform raw notification data
const transformNotification = (notif: Record<string, any>) => ({
    id: notif.id,
    type: notif.type || 'info',
    title: notif.title || 'Notification',
    message: notif.message || '',
    timestamp: notif.created_at ? formatTimestamp(notif.created_at) : 'Just now',
    isRead: notif.status === 'read',
    icon: getIconByType(notif.type || 'info'),
    created_at: notif.created_at, // Keep original for updates
});

interface NotifInfoModalProps {
    isViewModalOpen: boolean;
    handleCloseModal?: () => void;
    selectNotif: any; // Replace 'any' with a more specific type if you have one for notification data
}

const NotifInfoModal = ({ isViewModalOpen, handleCloseModal, selectNotif }: NotifInfoModalProps) => {
    const getTypeBadge = (status: string) => {
        const statusClasses: Record<string, string> = {
            appointment_status_update: 'bg-green-100 text-green-800',
            client_req: 'bg-yellow-100 text-yellow-800',
            rating_submitted: 'bg-blue-100 text-blue-800',
        };

        return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
    };

    const parseType = (text: string) => {
        const listText = text.split('_');

        const type = {
            client: 'Client Request',
            rating: 'Client Rating',
            appointment: 'Status Update',
        };

        return type[listText[0] as keyof typeof type];
    };

    return (
        <>
            <Modal open={isViewModalOpen} onClose={handleCloseModal} aria-labelledby="notification-details-modal">
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '95%', sm: '85%', md: 700 },
                        maxWidth: '700px',
                        maxHeight: { xs: '95vh', sm: '90vh', md: '100vh' },
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        borderRadius: 2,
                        overflow: 'hidden',
                    }}
                >
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6">
                        <Typography variant="h5" component="h2" className="text-base font-bold text-white sm:text-xl">
                            {selectNotif ? selectNotif.title : ''}
                        </Typography>
                        <button onClick={handleCloseModal} className="rounded-full p-1 text-white transition-colors hover:bg-blue-800 sm:p-2">
                            <X className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                    </div>

                    {selectNotif && (
                        <div className="overflow-y-auto p-3 sm:p-4 md:p-6" style={{ maxHeight: 'calc(95vh - 60px)' }}>
                            <div className="mb-4 rounded-lg bg-gray-50 p-3 sm:mb-6 sm:p-4">
                                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                                    <div>
                                        <p className="mb-1 text-xs text-gray-500">Notification ID</p>
                                        <p className="text-base font-bold text-gray-900 sm:text-lg">#{selectNotif.id}</p>
                                    </div>
                                    <span className={getTypeBadge(selectNotif.type)}>{parseType(selectNotif.type)}</span>
                                </div>
                            </div>

                            <div className="mb-4 sm:mb-6">
                                <h3 className="mb-2 flex items-center gap-2 border-b pb-2 text-xs font-semibold text-gray-700 sm:mb-3 sm:text-sm">
                                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                                    Notification Information
                                </h3>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 sm:gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Message</p>
                                        <p className="text-sm font-medium text-gray-900">{selectNotif.message}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Timestamp</p>
                                        <p className="text-sm font-medium text-gray-900">{selectNotif.timestamp}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Box>
            </Modal>
        </>
    );
};

export default function Notification() {
    usePage<SharedData>();
    const [notifications, setNotifications] = useState<Array<Record<string, any>>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const [notifInfo, setNotifInfo] = useState<any>(null);

    // Helper function to trigger unread count refresh in sidebar
    const refreshSidebarCount = () => {
        window.dispatchEvent(new CustomEvent('refreshNotificationCount'));
    };

    const handleFetchedNotif = async () => {
        try {
            const response = await fetch(route('notification.fetch'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
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
            .then((data) => {
                if (data && Array.isArray(data)) {
                    const transform = data.map(transformNotification);

                    // Sort by ID in descending order to show newest first
                    const sortedNotifications = transform.sort((a: Record<string, any>, b: Record<string, any>) => b.id - a.id);
                    setNotifications(sortedNotifications);
                }
            })
            .catch((error) => {
                console.error('Error fetching notifications:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });

        // Polling for new notifications - every 5 seconds for faster updates
        const pollInterval = setInterval(() => {
            handleFetchedNotif().then((data) => {
                if (data && Array.isArray(data)) {
                    const transform = data.map(transformNotification);
                    setNotifications(transform.sort((a: Record<string, any>, b: Record<string, any>) => b.id - a.id));
                }
            });
        }, 5000); // Poll every 5 seconds instead of 30

        // Cleanup function
        return () => {
            clearInterval(pollInterval);
        };
    }, []);

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const response = await fetch(route('notification.markAllAsRead'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // Update UI after successful backend operation
                setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
                // Refresh unread count in sidebar
                refreshSidebarCount();
            } else {
                alert('Failed to mark all notifications as read. Please try again.');
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
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
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                // Revert if backend operation failed
                setNotifications(originalNotifications);
                alert('Failed to clear all notifications. Please try again.');
            } else {
                // Refresh unread count in sidebar
                refreshSidebarCount();
            }
        } catch (error) {
            console.error('Error clearing all notifications:', error);
            // Revert on error
            setNotifications(originalNotifications);
            alert('Failed to clear all notifications. Please try again.');
        }
    };

    const markAsRead = async (id: number) => {
        try {
            setProcessingIds((prev) => new Set([...prev, id]));
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            // Optimistically update UI
            setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)));

            const response = await fetch(route('notification.markAsRead'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                // Revert if backend operation failed
                setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: false } : notif)));
            } else {
                // Refresh unread count in sidebar
                refreshSidebarCount();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert on error
            setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: false } : notif)));
        } finally {
            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    const removeNotification = async (id: number) => {
        try {
            setProcessingIds((prev) => new Set([...prev, id]));
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            // Optimistically remove from UI
            setNotifications((prev) => prev.filter((notif) => notif.id !== id));

            const response = await fetch(route('notification.clear'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                // Revert if backend operation failed - need to refetch
                const data = await handleFetchedNotif();
                if (data && Array.isArray(data)) {
                    const transform = data.map(transformNotification);
                    setNotifications(transform.sort((a: Record<string, any>, b: Record<string, any>) => b.id - a.id));
                }
            } else {
                // Refresh unread count in sidebar
                refreshSidebarCount();
            }
        } catch (error) {
            console.error('Error removing notification:', error);
            // Revert on error - need to refetch
            const data = await handleFetchedNotif();
            if (data && Array.isArray(data)) {
                const transform = data.map(transformNotification);
                setNotifications(transform.sort((a: Record<string, any>, b: Record<string, any>) => b.id - a.id));
            }
        } finally {
            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    const unreadCount = notifications.filter((notif) => !notif.isRead).length;

    const getNotificationStyle = (type: string) => {
        switch (type.toLowerCase()) {
            case 'success':
                return 'border-l-green-500';
            case 'warning':
                return 'border-l-yellow-500';
            case 'error':
                return 'border-l-red-500';
            case 'technician_note':
                return 'border-l-purple-500';
            case 'client_req':
                return 'border-l-indigo-500';
            case 'rating_submitted':
                return 'border-l-purple-500';
            case 'info':
            default:
                return 'border-l-blue-500';
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
            case 'rating_submitted':
                return 'text-purple-600';
            case 'info':
            default:
                return 'text-blue-600';
        }
    };

    const handleClose = () => {
        setNotifInfo(null);
        setIsOpenModal(false);
    };

    const handleNotifClick = (notification: any) => {
        setNotifInfo(notification);
        setIsOpenModal(true);
        markAsRead(notification.id);
    };

    return (
        <>
            <Head title="Notifications" />

            <NotifInfoModal isViewModalOpen={isOpenModal} handleCloseModal={handleClose} selectNotif={notifInfo} />

            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="min-h-screen bg-gray-50 p-6">
                    <div className="mx-auto max-w-5xl">
                        {/* Header */}
                        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center space-x-3">
                                    <Bell className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                                        <p className="text-gray-600">
                                            {isLoading
                                                ? 'Loading...'
                                                : unreadCount > 0
                                                  ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                                  : 'All notifications read'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={markAllAsRead}
                                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                                        disabled={unreadCount === 0 || isLoading}
                                        title="Mark all notifications as read"
                                    >
                                        <Check className="h-4 w-4" />
                                        <span className="hidden sm:inline">Mark All Read</span>
                                    </button>
                                    <button
                                        onClick={clearAllNotifications}
                                        className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                                        disabled={notifications.length === 0 || isLoading}
                                        title="Clear all notifications"
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="hidden sm:inline">Clear All</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading ? (
                            <div className="rounded-lg bg-white p-12 shadow-sm">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                    <p className="text-gray-500">Loading notifications...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Notifications List */}
                                <div className="rounded-lg bg-white shadow-sm">
                                    {notifications.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <Bell className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                            <h3 className="mb-2 text-lg font-medium text-gray-900">No notifications</h3>
                                            <p className="text-gray-500">You're all caught up! Check back later for new notifications.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-200">
                                            {notifications.map((notification) => {
                                                const IconComponent = notification.icon;
                                                return (
                                                    <div
                                                        key={notification.id}
                                                        className={`border-l-4 p-6 ${getNotificationStyle(notification.type)} ${
                                                            !notification.isRead ? 'bg-blue-50' : 'bg-white'
                                                        } cursor-pointer transition-colors hover:bg-gray-50`}
                                                        onClick={() => handleNotifClick(notification)}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start space-x-4">
                                                                <div className={`flex-shrink-0 ${getIconStyle(notification.type)}`}>
                                                                    <IconComponent className="h-6 w-6" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="mb-1 flex items-center space-x-2">
                                                                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                                                                        {!notification.isRead && (
                                                                            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                                                                        )}
                                                                    </div>
                                                                    <p className="mb-2 text-sm text-gray-700">{notification.message}</p>
                                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                                        <span className="flex items-center space-x-1">
                                                                            <Clock className="h-3 w-3" />
                                                                            <span>{notification.timestamp}</span>
                                                                        </span>
                                                                        {notification.isRead && (
                                                                            <span className="flex items-center space-x-1 text-green-600">
                                                                                <Check className="h-3 w-3" />
                                                                                <span>Read</span>
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4 flex items-center space-x-2">
                                                                {/* {!notification.isRead && (
                                                                    <button
                                                                        onClick={() => markAsRead(notification.id)}
                                                                        disabled={processingIds.has(notification.id)}
                                                                        className={`cursor-pointer rounded p-1 text-blue-600 transition-all duration-200 hover:scale-110 hover:bg-blue-100 hover:shadow-md active:scale-95 active:bg-blue-200 disabled:opacity-50 ${processingIds.has(notification.id) ? 'animate-pulse' : ''}`}
                                                                        title="Mark as read"
                                                                    >
                                                                        <Eye
                                                                            className={`h-4 w-4 ${processingIds.has(notification.id) ? 'animate-spin' : ''}`}
                                                                        />
                                                                    </button>
                                                                )} */}
                                                                <button
                                                                    onClick={() => removeNotification(notification.id)}
                                                                    disabled={processingIds.has(notification.id)}
                                                                    className={`cursor-pointer rounded p-1 text-red-600 transition-all duration-200 hover:scale-110 hover:bg-red-100 hover:shadow-md active:scale-95 active:bg-red-200 disabled:opacity-50 ${processingIds.has(notification.id) ? 'animate-pulse' : ''}`}
                                                                    title="Remove notification"
                                                                >
                                                                    <X
                                                                        className={`h-4 w-4 ${processingIds.has(notification.id) ? 'animate-spin' : ''}`}
                                                                    />
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
