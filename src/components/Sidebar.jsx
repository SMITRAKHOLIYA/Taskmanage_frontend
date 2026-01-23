import React, { useContext, useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';
import ThemeToggle from './ThemeToggle';
import FullscreenToggle from './FullscreenToggle';
import { useNotification } from '../context/NotificationContext';
import { useSync } from '../context/SyncContext';
import NotificationPanel from './NotificationPanel';
import api, { MEDIA_URL } from '../api';

const Sidebar = ({ isOpen, setIsOpen, isHovered, setIsHovered }) => {
    const { user, logout, refreshUser } = useContext(AuthContext);
    const { notificationUpdateTrigger } = useSync();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Notification Logic
    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            triggerReminders();
            refreshUser();
        }
    }, [user?.user?.id]);

    // Re-fetch when sync trigger updates
    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        }
    }, [notificationUpdateTrigger]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const triggerReminders = async () => {
        try {
            await api.get('/notifications/check-reminders');
        } catch (error) {
            console.error("Error triggering reminders", error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications');
            const notifications = Array.isArray(response.data) ? response.data : [];
            setUnreadCount(notifications.filter(n => n.is_read == 0).length);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    const navLinks = [
        {
            to: "/dashboard",
            label: "Dashboard",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
            visible: !user || user.user.role !== 'owner'
        },
        {
            to: "/tasks",
            label: "Tasks",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
            visible: true
        },
        {
            to: "/kanban",
            label: "Board",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>,
            visible: true
        },
        {
            to: "/owner-dashboard",
            label: "Owner Dashboard",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
            visible: user && user.user.role === 'owner'
        },
        {
            to: "/customers",
            label: "Customer",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
            visible: user && user.user.role === 'owner'
        },
        {
            to: "/projects",
            label: "Projects",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
            visible: user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner')
        },
        {
            to: "/users",
            label: "Users",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
            visible: user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner')
        },
        {
            to: "/analytics",
            label: "Analytics",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
            visible: user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner')
        },
    ];

    return (
        <aside
            className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
                ${isOpen ? 'translate-x-0 w-[85vw]' : '-translate-x-full'} 
                md:translate-x-0 ${isHovered ? 'md:w-64' : 'md:w-20'}`}
            aria-label="Sidebar"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="h-full flex flex-col justify-between bg-white dark:bg-gray-900 overflow-hidden">
                {/* Top Section: Logo, Profile & Nav */}
                <div className="px-3 py-4 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                    {/* Logo Section */}
                    <div className={`flex items-center mb-6 transition-all duration-300 ${isHovered ? 'justify-between px-2' : 'justify-center is-collapsed'}`}>
                        <Link to="/dashboard" className="flex items-center gap-3 no-underline">
                            <div className="relative h-10 w-10 flex-shrink-0">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg blur opacity-25"></div>
                                <img src={logo} alt="TaskMaster" className="relative h-full w-full object-contain" />
                            </div>
                            <span className={`self-center text-xl font-bold whitespace-nowrap dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 transition-opacity duration-300 ${isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                                TaskMaster
                            </span>
                        </Link>
                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* User Profile */}
                    {user && (
                        <div
                            className={`mb-6 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 transition-all duration-300 cursor-pointer ${isHovered ? 'mx-1' : 'mx-0 aspect-square flex items-center justify-center'}`}
                            onClick={() => navigate('/profile')}
                        >
                            <div className={`flex items-center ${isHovered ? 'gap-3' : 'justify-center'} group`}>
                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 p-[2px]">
                                    <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                                        {user?.user?.profile_pic ? (
                                            <img
                                                src={user.user.profile_pic.startsWith('http') ? user.user.profile_pic : `${MEDIA_URL}${user.user.profile_pic}`}
                                                alt="Profile"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="font-bold text-gray-700 dark:text-white text-sm">
                                                {user?.user?.username?.charAt(0)?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={`flex-1 min-w-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                        {user?.user?.username}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                                        {user?.user?.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <ul className="space-y-2 font-medium">
                        {navLinks.filter(link => link.visible).map(link => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    className={({ isActive }) => `flex items-center p-3 rounded-lg group transition-all duration-200 ${isActive
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                        } ${isHovered ? 'justify-start' : 'justify-center'}`}
                                    onClick={() => setIsOpen(false)}
                                    title={!isHovered ? link.label : ''}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span className={`transition-colors duration-200 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                                                {link.icon}
                                            </span>
                                            <span className={`ml-3 transition-opacity duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                                                {link.label}
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bottom Section: Actions Only */}
                <div className={`border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 transition-all duration-300`}>
                    <div className={`flex items-center p-3 ${isHovered ? 'justify-around flex-row' : 'flex-col gap-4'}`}>
                        <ThemeToggle positionClass={`${isHovered ? 'bottom-full left-0 mb-2 origin-bottom-left' : 'bottom-0 left-full ml-2 origin-bottom-left'}`} />

                        <FullscreenToggle className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors" />

                        {/* Notification Bell */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications) fetchUnreadCount();
                                }}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors relative"
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
                                    onClose={() => setShowNotifications(false)}
                                    positionClass={`fixed z-50 ${isHovered ? 'bottom-20 left-4 w-96 origin-bottom-left' : 'bottom-4 left-20 w-80 origin-bottom-left'}`}
                                />
                            )}
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            title="Logout"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
