import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CommandPalette from './CommandPalette';
import FloatingActionButton from './FloatingActionButton';

const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
            <CommandPalette />
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 overflow-x-hidden">
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 mt-16 md:mt-0 p-2 md:p-4">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-gray-900/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <FloatingActionButton />
        </div>
    );
};

export default MainLayout;
