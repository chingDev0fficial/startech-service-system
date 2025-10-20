import AppLayout from '@/layouts/app-layout';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useEcho } from '@laravel/echo-react';
import { useEffect, useState } from 'react';
import { Bell, Check, Clock, AlertTriangle, Info, CheckCircle, User, Calendar, Settings, Eye, X } from 'lucide-react';
import { FormEventHandler } from 'react';
import { CustomRadio } from "@/components/custom-radio";
import { Head, useForm, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifications',
        href: '#',
    },
];

export default function notification() {
    const echo = useEcho();
    // Sample notification data
    const [notifications, setNotifications] = useState<any[]>([]);

    const handleFetchedNotif = async () => {
        try {
            const response = await fetch(route('notification.fetch'), {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if ( !response.ok ) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.retrieved;

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        handleFetchedNotif()
            .then(data => { // Fixed: 'data' parameter instead of 'notific'
                const transform = data
                    .map((notif: any) => ({
                        id: notif.id,
                        type: notif.type,
                        title: notif.title,
                        message: notif.message,
                        timestamp: '2 hours ago',
                        isRead: notif.status === 'read',
                        icon: User
                    }));

                // Fixed: Do something with transform (set state, etc.)
                setNotifications(transform.reverse());

                // Fixed: Echo setup moved outside of .then()
            })
            .catch(error => {
                console.error('Error fetching notifications:', error);
            });

        // Fixed: Echo channel setup outside of .then()
        const channel = echo.channel('notif')
            .listen('.notif.retrieve', (event: any) => {
                const newServices = event.services || [event];
                const transformedNewServices = newServices
                    .filter((service: any) => service.user_id === currentUserId)
                    .filter((service: any) => service.appointment_status === 'pending' || service.appointment_status === 'in-progress')
                    .map((service: any) => ({
                        id: notif.id,
                        type: notif.type,
                        title: notif.title,
                        message: notif.message,
                        timestamp: '2 hours ago',
                        isRead: notif.status === 'read',
                        icon: User
                    }));

                // Fixed: Do something with transformedNewServices
                setNotifications(prev => [...transformedNewServices, ...prev]);
            });

        // Fixed: Cleanup function
        return () => {
            echo.leaveChannel('notif'); // Fixed: Use correct channel name
        };
    }, [echo]); // Fixed: Added missing semicolon

    const notif = notifications;

    const markAllAsRead = async () => {
        // setNotifications(prev =>
        //     prev.map(notif => ({ ...notif, isRead: true }))
        // );

        console.log('Marking all as read');

        try {

            const response = await fetch(route('notification.markAllAsRead'), {
                method: 'POST',
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || '',
                    "Content-Type": "application/json",
                }
            })

            console.log(response);

            if ( !response.ok ) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setNotifications(prev =>
                prev.map(notif => ({ ...notif, isRead: true }))
            );

        } catch (error) {
            console.error(error);
        };

        console.log('All notifications marked as read');
    };

    const clearAllNotifications = async () => {

        try {

            const response = await fetch(route('notification.clearAll'), {
                method: 'POST',
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || '',
                    "Content-Type": "application/json",
                }
            });

            if ( !response.ok ) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

        } catch (error) {
            console.error(error);
        }

        setNotifications([]);
    };

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
        );
    };

    const removeNotification = async (id: number) => {
        try {
            const reposonse = await fetch(route('notification.clear'), {
                method: 'POST',
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || '',
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({id: id}),
            });

            if ( !reposonse.ok ) {
                throw new Error(`HTTP error! status: ${reposonse.status}`);
            }
        } catch (error) {
            console.error(error);
        }

        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const unreadCount = notifications.filter(notif => !notif.isRead).length;

    const getNotificationStyle = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-l-green-500 bg-green-50';
            case 'warning':
                return 'border-l-yellow-500 bg-yellow-50';
            case 'error':
                return 'border-l-red-500 bg-red-50';
            case 'info':
            default:
                return 'border-l-blue-500 bg-blue-50';
        }
    };

    const getIconStyle = (type: string) => {
        switch (type) {
            case 'success':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            case 'error':
                return 'text-red-600';
            case 'info':
            default:
                return 'text-blue-600';
        }
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="min-h-screen bg-gray-50 p-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Header */}
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Bell className="w-8 h-8 text-blue-600" />
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                                        <p className="text-gray-600">
                                            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={markAllAsRead}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={unreadCount === 0}
                                    >
                                        Mark All Read
                                    </button>
                                    <button
                                        onClick={clearAllNotifications}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={notifications.length === 0}
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </div>

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

                        {/* Notification Stats */}
                        {notifications.length > 0 && (
                            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
                                        <div className="text-sm text-gray-500">Total Notifications</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
                                        <div className="text-sm text-gray-500">Unread</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {notifications.length - unreadCount}
                                        </div>
                                        <div className="text-sm text-gray-500">Read</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
