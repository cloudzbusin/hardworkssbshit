'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: number;
}

export default function NotificationBell() {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications?limit=20');
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (notificationId?: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notificationId ? { notificationId } : { markAllRead: true })
            });
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications?id=${notificationId}`, { method: 'DELETE' });
            fetchNotifications();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'streamer_live': return '🔴';
            case 'friend_online': return '🟢';
            case 'achievement': return '🏆';
            case 'message': return '💬';
            case 'friend_request': return '👥';
            case 'new_follower': return '👤';
            case 'referral': return '🎁';
            default: return '🔔';
        }
    };

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    if (!user) return null;

    return (
        <div style={{ position: 'relative' }}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    background: 'rgba(83, 252, 24, 0.1)',
                    border: '1px solid rgba(83, 252, 24, 0.3)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>🔔</span>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#FF4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '350px',
                    maxHeight: '500px',
                    background: '#0a0a0a',
                    border: '1px solid rgba(83, 252, 24, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '15px',
                        borderBottom: '1px solid rgba(83, 252, 24, 0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0, color: '#53FC18', fontSize: '1rem' }}>
                            Notifications ({unreadCount})
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAsRead()}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#53FC18',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{
                                padding: '40px 20px',
                                textAlign: 'center',
                                color: '#666'
                            }}>
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    style={{
                                        padding: '12px 15px',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                        background: notif.read ? 'transparent' : 'rgba(83, 252, 24, 0.05)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onClick={() => {
                                        if (!notif.read) markAsRead(notif.id);
                                        if (notif.link) window.location.href = notif.link;
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                        <span style={{ fontSize: '1.5rem' }}>
                                            {getNotificationIcon(notif.type)}
                                        </span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                color: '#fff',
                                                fontSize: '0.9rem',
                                                fontWeight: notif.read ? 'normal' : 'bold',
                                                marginBottom: '4px'
                                            }}>
                                                {notif.title}
                                            </div>
                                            <div style={{
                                                color: '#888',
                                                fontSize: '0.8rem',
                                                marginBottom: '4px'
                                            }}>
                                                {notif.message}
                                            </div>
                                            <div style={{ color: '#666', fontSize: '0.7rem' }}>
                                                {formatTime(notif.createdAt)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notif.id);
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#666',
                                                cursor: 'pointer',
                                                fontSize: '1.2rem'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
