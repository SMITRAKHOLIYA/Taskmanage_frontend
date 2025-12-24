import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import api, { MEDIA_URL } from '../api';
import NotificationPanel from './NotificationPanel';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

const NavLink = ({ to, children, icon }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link to={to} className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400'}`}>
            <span className={`transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {icon}
            </span>
            <span className="hidden xl:inline">{children}</span>
        </Link>
    );
};

const MobileNavLink = ({ to, children, icon, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${isActive
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
        >
            <span className={`${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {icon}
            </span>
            {children}
        </Link>
    );
};

const Navbar = () => {
    const { user, logout, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [hidden, setHidden] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 150) {
            setHidden(true);
            setIsMobileMenuOpen(false); // Close mobile menu when scrolling down
        } else {
            setHidden(false);
        }
    });


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (user && user.user.role === 'user') {
            fetchUnreadCount();
            triggerReminders();
            refreshUser();
            const interval = setInterval(() => {
                fetchUnreadCount();
                triggerReminders();
                refreshUser();
            }, 60000); // Poll every minute
            return () => clearInterval(interval);
        }
    }, [user?.user?.id]);

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
            // Only show unread notifications
            const unread = response.data.filter(n => n.is_read == 0).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    const navLinks = [
        {
            to: "/dashboard",
            label: "Dashboard",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
            visible: !user || user.user.role !== 'owner'
        },
        {
            to: "/tasks",
            label: "Tasks",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
            visible: true
        },
        {
            to: "/kanban",
            label: "Board",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>,
            visible: true
        },
        {
            to: "/owner-dashboard",
            label: "Owner Dashboard",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
            visible: user && user.user.role === 'owner'
        },
        {
            to: "/projects",
            label: "Projects",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
            visible: user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner')
        },
        {
            to: "/users",
            label: "Users",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
            visible: user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner')
        },
        {
            to: "/analytics",
            label: "Analytics",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
            visible: user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner')
        },
    ];

    return (

        <motion.nav
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/dashboard" className="flex items-center gap-3 group no-underline">
                            <div className="relative h-10 w-10">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                                <img src="/task_frontend/logo.png" alt="TaskMaster Logo" className="relative h-full w-full object-contain" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 hidden sm:block group-hover:to-primary-400 transition-all duration-300">
                                TaskMaster
                            </span>
                        </Link>
                    </div>

                    {/* Center: Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-center gap-1">
                        {navLinks.filter(link => link.visible).map(link => (
                            <NavLink key={link.to} to={link.to} icon={link.icon}>
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right: Actions & Mobile Toggle */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {user && (
                            <>
                                {/* Points (Desktop Only) */}
                                {user?.user?.role === 'user' && (
                                    <div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-full shadow-sm min-w-[3rem] text-center" title="Points">
                                            {user?.user?.points || 0} pts
                                        </span>
                                    </div>
                                )}

                                <ThemeToggle />

                                {/* Notifications */}
                                {user.user.role === 'user' && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowNotifications(!showNotifications)}
                                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors relative"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
                                            )}
                                        </button>
                                        {showNotifications && (
                                            <NotificationPanel onClose={() => setShowNotifications(false)} />
                                        )}
                                    </div>
                                )}

                                {/* User Profile (Desktop) */}
                                <Link to="/profile" className="hidden sm:flex items-center gap-2 group">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 p-[2px] cursor-pointer hover:shadow-lg hover:shadow-primary-500/20 transition-all duration-300">
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
                                </Link>

                                {/* Logout (Desktop) */}
                                <button
                                    onClick={handleLogout}
                                    className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors shadow-lg"
                                    title="Logout"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>

                                {/* Mobile Menu Trigger */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                                >
                                    <span className="sr-only">Open main menu</span>
                                    {isMobileMenuOpen ? (
                                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <motion.div
                initial={false}
                animate={isMobileMenuOpen ? "open" : "closed"}
                variants={{
                    open: { height: "auto", opacity: 1, display: "block" },
                    closed: { height: 0, opacity: 0, transitionEnd: { display: "none" } }
                }}
                className="md:hidden overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
            >
                <div className="px-2 pt-2 pb-3 space-y-1">
                    {navLinks.filter(link => link.visible).map(link => (
                        <MobileNavLink
                            key={link.to}
                            to={link.to}
                            icon={link.icon}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.label}
                        </MobileNavLink>
                    ))}

                    {/* Mobile User Actions */}
                    <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 mt-4">
                        <div className="flex items-center px-4 mb-4">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 p-[2px]">
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
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-gray-800 dark:text-white">{user?.user?.username}</div>
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.user?.email}</div>
                                {user?.user?.role === 'user' && (
                                    <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-1">{user?.user?.points || 0} pts</div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1 px-2">
                            <MobileNavLink to="/profile" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} onClick={() => setIsMobileMenuOpen(false)}>
                                Your Profile
                            </MobileNavLink>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.nav>
    );
};

export default Navbar;
