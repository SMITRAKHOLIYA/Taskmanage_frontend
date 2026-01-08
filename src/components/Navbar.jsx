import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import api from '../api';
import NotificationPanel from './NotificationPanel';
import logo from '../assets/logo.png';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
    const { user } = useContext(AuthContext);
    const { notificationUpdateTrigger } = useSync();
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        }
    }, [user, notificationUpdateTrigger]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications');
            const notifications = Array.isArray(response.data) ? response.data : [];
            setUnreadCount(notifications.filter(n => n.is_read == 0).length);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 md:hidden transition-all duration-300"
            initial={false}
        >
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Mobile Toggle (Hamburger) */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>


                    {/* Branding: Logo & Name (Centered) */}
                    <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
                        <div className="relative h-8 w-8">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg blur opacity-40"></div>
                            <img src={logo} alt="TaskMaster" className="relative h-full w-full object-contain" />
                        </div>
                        <span className="self-center text-lg font-bold whitespace-nowrap dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                            TaskMaster
                        </span>
                    </div>

                    {/* Right: Notification Bell */}
                    <div className="flex items-center gap-2 sm:gap-4" ref={notificationRef}>
                        <button
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                if (!showNotifications) fetchUnreadCount();
                            }}
                            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white relative focus:outline-none"
                            aria-label="Notifications"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <NotificationPanel
                                onClose={() => {
                                    setShowNotifications(false);
                                    fetchUnreadCount();
                                }}
                                positionClass="absolute top-full right-0 mt-2 w-80 max-w-[90vw] z-50 origin-top-right"
                            />
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
