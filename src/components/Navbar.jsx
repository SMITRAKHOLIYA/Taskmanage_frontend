import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
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

                    {/* Right: Empty for now, or maybe breadcrumbs later */}
                    <div className="flex items-center gap-2 sm:gap-4">
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
