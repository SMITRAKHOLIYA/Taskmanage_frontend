import React, { createContext, useState, useContext, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import NotificationToast from '../components/NotificationToast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    // notify('success', 'Task created successfully!')
    const notify = useCallback((type, message, duration = 3000) => {
        const id = Date.now() + Math.random();
        setNotifications(prev => [...prev, { id, type, message, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Helper functions for cleaner API
    const success = (msg, duration) => notify('success', msg, duration);
    const error = (msg, duration) => notify('error', msg, duration);
    const info = (msg, duration) => notify('info', msg, duration);
    const warning = (msg, duration) => notify('warning', msg, duration);

    return (
        <NotificationContext.Provider value={{ notify: { success, error, info, warning }, removeNotification }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4">
                <AnimatePresence mode='popLayout'>
                    {notifications.map(notification => (
                        <NotificationToast
                            key={notification.id}
                            {...notification}
                            onClose={() => removeNotification(notification.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
