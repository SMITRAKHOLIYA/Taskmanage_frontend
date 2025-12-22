import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            // Only show unread notifications
            setNotifications(response.data.filter(n => n.is_read == 0));
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}`);
            // Remove from local state immediately
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error("Error marking notification as read", error);
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

    return (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Close</span>
                    &times;
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No notifications
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {notifications.map(notification => (
                            <li
                                key={notification.id}
                                className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${notification.is_read == 0 ? 'bg-blue-50' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {notification.type === 'assignment' ? 'New Task Assigned' : 'Reminder'}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {notification.is_read == 0 && (
                                        <span className="ml-2 bg-white rounded-full p-1 text-blue-600">
                                            <span className="block h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
                                        </span>
                                    )}
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
