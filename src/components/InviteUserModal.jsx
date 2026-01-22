import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const InviteUserModal = ({ isOpen, onClose, onInviteSuccess }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const { notify } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Professional Email Regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            notify.error('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/invites', { email, role });
            notify.success('Invitation sent successfully!');
            onInviteSuccess && onInviteSuccess();
            onClose();
            setEmail('');
            setRole('user');
        } catch (error) {
            console.error("Invite error", error);
            notify.error(error.response?.data?.message || 'Failed to send invitation.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Determine allowed roles based on current user role
    const currentUserRole = user?.user?.role;
    const canInviteAdmin = currentUserRole === 'owner';
    const canInviteManager = currentUserRole === 'owner';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    <form onSubmit={handleSubmit} className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Invite New User</h3>
                        <p className="text-sm text-gray-500 mb-4">Send an email invitation to join your workspace.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="colleague@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Role</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="user" className="bg-white dark:bg-[#1a1f2e] text-gray-900 dark:text-white">User</option>
                                    {canInviteManager && (
                                        <option value="manager" className="bg-white dark:bg-[#1a1f2e] text-gray-900 dark:text-white">Manager</option>
                                    )}
                                    {canInviteAdmin && (
                                        <option value="admin" className="bg-white dark:bg-[#1a1f2e] text-gray-900 dark:text-white">Admin</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium shadow-lg shadow-primary-600/20 transition-all flex items-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : 'Send Invite'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default InviteUserModal;
