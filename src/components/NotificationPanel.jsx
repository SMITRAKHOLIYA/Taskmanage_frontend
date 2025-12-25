import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        try {
            await api.post(`/notifications/${id}/read`);
        } catch (error) {
            console.error("Error marking notification as read", error);
        }
    };

    const clearNotification = async (e, id) => {
        e.stopPropagation(); // Prevent click triggering navigation
        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id));
        try {
            await api.delete(`/notifications/${id}`);
        } catch (error) {
            console.error("Error deleting notification", error);
        }
    };

    const clearAllNotifications = async () => {
        setNotifications([]);
        try {
            await api.delete('/notifications/all');
        } catch (error) {
            console.error("Error clearing all notifications", error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (notification.is_read == 0) {
            await markAsRead(notification.id);
        }
        onClose();
        if (notification.task_id) {
            navigate(`/tasks/${notification.task_id}`);
        }
    };

    // Calculate Unread
    const unreadCount = notifications.filter(n => n.is_read == 0).length;

    return (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden transform transition-all duration-200 ease-out origin-top-right">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} New
                        </span>
                    )}
                </div>
                {notifications.length > 0 && (
                    <button
                        onClick={clearAllNotifications}
                        className="text-xs font-medium text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* List */}
            <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 mb-3">
                            <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">All caught up!</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No new notifications for you.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map(notification => (
                            <li
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`relative group px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${notification.is_read == 0 ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}`}
                            >
                                <div className="flex justify-between items-start gap-3">
                                    {/* Icon based on type */}
                                    <div className={`flex-shrink-0 mt-1 rounded-full p-1.5 ${notification.type === 'assignment'
                                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                                        : (notification.type === 'overdue' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400')
                                        }`}>
                                        {notification.type === 'assignment' && (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        )}
                                        {notification.type === 'overdue' && (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        )}
                                        {notification.type === 'reminder' && (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${notification.is_read == 0 ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            {new Date(notification.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1">
                                        {notification.is_read == 0 && (
                                            <span className="block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-gray-800"></span>
                                        )}
                                        <button
                                            onClick={(e) => clearNotification(e, notification.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
                                            title="Clear"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
