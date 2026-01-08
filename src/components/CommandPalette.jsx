import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const { logout, user } = useContext(AuthContext);

    // Default Commands
    const commands = [
        { id: 'home', label: 'Go to Dashboard', icon: '🏠', action: () => navigate('/dashboard'), category: 'Navigation' },
        { id: 'tasks', label: 'Go to Tasks', icon: '✅', action: () => navigate('/tasks'), category: 'Navigation' },
        { id: 'board', label: 'Go to Kanban Board', icon: '📋', action: () => navigate('/kanban'), category: 'Navigation' },
        { id: 'create-task', label: 'Create New Task', icon: '➕', action: () => navigate('/create-task'), category: 'Actions' },
        { id: 'profile', label: 'View Profile', icon: '👤', action: () => navigate('/profile'), category: 'Navigation' },
        { id: 'settings', label: 'Settings', icon: '⚙️', action: () => navigate('/settings'), category: 'Navigation' },
        { id: 'theme', label: 'Toggle Theme', icon: '🌓', action: () => document.getElementById('theme-toggle')?.click(), category: 'Actions' },
        { id: 'logout', label: 'Logout', icon: '🚪', action: () => { logout(); navigate('/login'); }, category: 'Account' },
    ];

    // Add role-based commands
    if (user?.user?.role === 'owner') {
        commands.push(
            { id: 'owner', label: 'Owner Dashboard', icon: '👑', action: () => navigate('/owner-dashboard'), category: 'Navigation' },
            { id: 'companies', label: 'Manage Companies', icon: '🏢', action: () => navigate('/companies'), category: 'Admin' }
        );
    }

    if (['admin', 'manager', 'owner'].includes(user?.user?.role)) {
        commands.push(
            { id: 'users', label: 'Manage Users', icon: '👥', action: () => navigate('/users'), category: 'Admin' },
            { id: 'projects', label: 'Manage Projects', icon: '📁', action: () => navigate('/projects'), category: 'Admin' }
        );
    }

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    const handleKeyDown = useCallback((e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen(prev => !prev);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (isOpen) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                    setIsOpen(false);
                    setQuery('');
                }
            }
        }
    }, [isOpen, filteredCommands, selectedIndex]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden relative z-50 flex flex-col max-h-[60vh]"
                    >
                        {/* Search Input */}
                        <div className="flex items-center p-4 border-b border-white/10">
                            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Type a command or search..."
                                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="text-xs text-gray-500 font-mono border border-gray-700 rounded px-1.5 py-0.5">ESC</div>
                        </div>

                        {/* Results */}
                        <div className="overflow-y-auto custom-scrollbar p-2">
                            {filteredCommands.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredCommands.map((cmd, index) => (
                                        <div
                                            key={cmd.id}
                                            onClick={() => {
                                                cmd.action();
                                                setIsOpen(false);
                                            }}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors ${index === selectedIndex
                                                    ? 'bg-[#00f6ff]/10 text-[#00f6ff]'
                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{cmd.icon}</span>
                                                <span className="font-medium">{cmd.label}</span>
                                            </div>
                                            {index === selectedIndex && (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <p>No results found.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 bg-white/5 border-t border-white/5 text-xs text-gray-500 flex justify-between">
                            <span>Cmd+K to open</span>
                            <div className="flex gap-3">
                                <span>↑↓ to navigate</span>
                                <span>↵ to select</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
