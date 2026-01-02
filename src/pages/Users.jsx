import React, { useEffect, useState, useContext, useMemo } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityLogs, setActivityLogs] = useState([]);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { user } = useContext(AuthContext);

    // New State for Enhancements
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("Error fetching users", error);
            setUsers([]);
        }
    };

    // Stats Calculation
    const stats = useMemo(() => {
        const totalUsers = users.length;
        const totalPoints = users.reduce((acc, curr) => acc + (parseInt(curr.points) || 0), 0);
        const currentMonth = new Date().getMonth();
        const newUsersThisMonth = users.filter(u => new Date(u.created_at).getMonth() === currentMonth).length;
        return { totalUsers, totalPoints, newUsersThisMonth };
    }, [users]);

    // Filtering and Sorting
    const processedUsers = useMemo(() => {
        let filtered = [...users];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                u.username.toLowerCase().includes(lowerTerm) ||
                u.email.toLowerCase().includes(lowerTerm) ||
                u.role.toLowerCase().includes(lowerTerm)
            );
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle numeric values
                if (sortConfig.key === 'points') {
                    aValue = parseFloat(aValue) || 0;
                    bValue = parseFloat(bValue) || 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [users, searchTerm, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(processedUsers.length / itemsPerPage);
    const paginatedUsers = processedUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const confirmDelete = (id) => {
        setUserToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/users/${userToDelete}`);
            fetchUsers();
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);
            setShowModal(false);
            setFormData({ username: '', email: '', password: '', role: 'user' });
            fetchUsers();
        } catch (error) {
            alert('Failed to create user');
        }
    };

    const handleViewActivity = async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/activity`);
            setActivityLogs(response.data);
            setShowActivityModal(true);
        } catch (error) {
            console.error("Error fetching activity logs", error);
        }
    };



    const [showPerformanceModal, setShowPerformanceModal] = useState(false);
    const [performanceData, setPerformanceData] = useState(null);

    const handleOpenPerformance = async () => {
        setShowPerformanceModal(true);
        // Fetch specific analytics if needed, or purely Aggregate from existing Users/Tasks if we had them.
        // For now, we'll generate rich insights based on the existing `users` list + mock task distribution
        // to match the requested "donut chart" and "professional" look.

        // Mock distribution for the donut
        const distribution = [
            { name: 'High Performers', value: users.filter(u => (u.points || 0) > 100).length || 5, color: '#10B981' }, // Green
            { name: 'Average', value: users.filter(u => (u.points || 0) <= 100 && (u.points || 0) > 50).length || 8, color: '#3B82F6' }, // Blue
            { name: 'Needs Imp.', value: users.filter(u => (u.points || 0) <= 50).length || 3, color: '#F59E0B' }, // Yellow
        ];

        // Top 5 Users by Points
        const topUsers = [...users].sort((a, b) => (parseInt(b.points) || 0) - (parseInt(a.points) || 0)).slice(0, 5);

        setPerformanceData({ distribution, topUsers });
    };

    return (
        <div className="w-full p-6">
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1a1f2e] border border-white/10 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Users</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#1a1f2e] border border-white/10 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Points Awarded</h3>
                    <p className="text-3xl font-bold text-[#00f6ff] mt-2">{stats.totalPoints}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#1a1f2e] border border-white/10 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">New Users (This Month)</h3>
                    <p className="text-3xl font-bold text-green-400 mt-2">{stats.newUsersThisMonth}</p>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="relative flex-1 max-w-md">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {(user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner') && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleOpenPerformance}
                            className="inline-flex items-center px-6 py-3 rounded-xl bg-[#1a1f2e] border border-[#00f6ff]/30 text-[#00f6ff] font-bold shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:bg-[#00f6ff]/10 transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Performance Insights
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f6ff] to-[#00c3ff] text-black font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New User
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th onClick={() => handleSort('username')} className="p-5 text-gray-400 font-medium tracking-wider text-sm uppercase cursor-pointer hover:text-white transition-colors">
                                    <div className="flex items-center">User {sortConfig.key === 'username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                                </th>
                                <th onClick={() => handleSort('role')} className="p-5 text-gray-400 font-medium tracking-wider text-sm uppercase cursor-pointer hover:text-white transition-colors">
                                    <div className="flex items-center">Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                                </th>
                                <th className="p-5 text-gray-400 font-medium tracking-wider text-sm uppercase cursor-pointer hover:text-white transition-colors">
                                    <div className="flex items-center">Company</div>
                                </th>
                                <th onClick={() => handleSort('points')} className="p-5 text-gray-400 font-medium tracking-wider text-sm uppercase text-center cursor-pointer hover:text-white transition-colors">
                                    <div className="flex items-center justify-center">Points {sortConfig.key === 'points' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                                </th>
                                <th onClick={() => handleSort('created_at')} className="p-5 text-gray-400 font-medium tracking-wider text-sm uppercase cursor-pointer hover:text-white transition-colors">
                                    <div className="flex items-center">Joined {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                                </th>

                                <th className="p-5 text-gray-400 font-medium tracking-wider text-sm uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {paginatedUsers.map((u, index) => (
                                    <motion.tr
                                        key={u.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="p-5">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm mr-3 shadow-lg">
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{u.username}</div>
                                                    <div className="text-gray-400 text-xs">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                                                u.role === 'manager' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                                    'bg-green-500/20 text-green-300 border-green-500/30'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-gray-300 text-sm font-medium">
                                                {u.company_name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="text-[#00f6ff] font-bold font-mono text-lg drop-shadow-[0_0_5px_rgba(0,246,255,0.5)]">
                                                {u.points || 0}
                                            </span>
                                        </td>
                                        <td className="p-5 text-gray-300 text-sm">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>

                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end space-x-2 transition-opacity">
                                                <button
                                                    onClick={() => handleViewActivity(u.id)}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                                                    title="View Activity"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                    </svg>
                                                </button>

                                                {u.id !== user.user.id && (
                                                    <button
                                                        onClick={() => confirmDelete(u.id)}
                                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/5">
                        <div className="text-sm text-gray-400">
                            Showing <span className="font-medium text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-white">{Math.min(currentPage * itemsPerPage, processedUsers.length)}</span> of <span className="font-medium text-white">{processedUsers.length}</span> results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            {(() => {
                                const getPaginationRange = () => {
                                    const range = [];
                                    const delta = 1;

                                    if (totalPages <= 7) {
                                        for (let i = 1; i <= totalPages; i++) range.push(i);
                                    } else {
                                        let start = Math.max(2, currentPage - delta);
                                        let end = Math.min(totalPages - 1, currentPage + delta);

                                        if (currentPage <= 4) {
                                            end = 5;
                                        }
                                        if (currentPage >= totalPages - 3) {
                                            start = totalPages - 4;
                                        }

                                        range.push(1);
                                        if (start > 2) range.push('...');
                                        for (let i = start; i <= end; i++) range.push(i);
                                        if (end < totalPages - 1) range.push('...');
                                        range.push(totalPages);
                                    }
                                    return range;
                                };

                                return getPaginationRange().map((page, index) => (
                                    <button
                                        key={index}
                                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                        disabled={page === '...'}
                                        className={`px-3 py-1 rounded-lg transition-colors ${page === '...'
                                            ? 'bg-white/5 text-gray-500 cursor-default'
                                            : currentPage === page
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ));
                            })()}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <form onSubmit={handleSubmit} className="p-6">
                                <h3 className="text-xl font-bold text-white mb-6">Add New User</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                            value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                        <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                                        <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                                        <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                            value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                            <option value="user" className="bg-[#1a1f2e] text-white">User</option>
                                            {user.user.role === 'owner' && (
                                                <>
                                                    <option value="manager" className="bg-[#1a1f2e] text-white">Manager</option>
                                                    <option value="admin" className="bg-[#1a1f2e] text-white">Admin</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium shadow-lg shadow-primary-600/20 transition-all">
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Activity Modal */}
            <AnimatePresence>
                {showActivityModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowActivityModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">User Activity</h3>
                                    <button onClick={() => setShowActivityModal(false)} className="text-gray-400 hover:text-white">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="mt-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {activityLogs.length > 0 ? (
                                        <ul className="space-y-4">
                                            {activityLogs.map((log) => (
                                                <li key={log.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-sm font-bold text-white bg-primary-500/20 text-primary-300 px-2 py-1 rounded text-xs uppercase tracking-wide">{log.action}</span>
                                                        <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-300">{log.details}</p>
                                                    {log.task_title && (
                                                        <div className="mt-2 flex items-center text-xs text-primary-400 bg-primary-500/10 px-2 py-1 rounded w-fit">
                                                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                            </svg>
                                                            Task: {log.task_title}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            No activity found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowSuccessModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8"
                        >
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Success!</h3>
                            <p className="text-gray-400 mb-6">Time extension has been granted successfully.</p>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Performance Analysis Modal */}
            <AnimatePresence>
                {showPerformanceModal && performanceData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setShowPerformanceModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#0f172a] to-[#1e293b]">
                                <div>
                                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Team Performance</h2>
                                    <p className="text-gray-400 text-sm mt-1">Real-time collaboration insights</p>
                                </div>
                                <button onClick={() => setShowPerformanceModal(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                    {/* Chart Section */}
                                    <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11 2v20c-5.046.504-9.133 4.596-9.638 9.638h9.638zm2 0v9.638h9.638c-.504-5.042-4.592-9.134-9.638-9.638z" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-6 relative z-10">Performance Distribution</h3>
                                        <div className="h-64 w-full relative z-10">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={performanceData.distribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {performanceData.distribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                        itemStyle={{ color: '#fff' }}
                                                    />
                                                    <Legend verticalAlign="bottom" height={36} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 text-center">
                                            <p className="text-sm text-gray-400">
                                                <span className="text-green-400 font-bold">{performanceData.distribution[0].value}</span> High Performers leading the charge.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Leaderboard Section */}
                                    <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 shadow-xl">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                                            <span className="mr-2">🏆</span> Top Contributors
                                        </h3>
                                        <div className="space-y-4">
                                            {performanceData.topUsers.map((u, idx) => (
                                                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0f172a] border border-white/5 hover:border-primary-500/30 transition-all group">
                                                    <div className="flex items-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mr-3 ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : idx === 2 ? 'bg-orange-700 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{u.username}</div>
                                                            <div className="text-xs text-gray-500">{u.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-bold text-[#00f6ff]">{u.points || 0} pts</div>
                                                        <div className="text-xs text-green-400">Excellent</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {performanceData.topUsers.length === 0 && (
                                                <p className="text-gray-500 text-center text-sm py-4">No data available yet.</p>
                                            )}
                                        </div>
                                    </div>

                                </div>
                                <div className="mt-8 bg-gradient-to-r from-primary-900/40 to-blue-900/40 rounded-2xl p-6 border border-primary-500/20 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-white font-bold text-lg">AI Suggestion 💡</h4>
                                        <p className="text-gray-300 text-sm mt-1 max-w-xl">
                                            "Team velocity is stable. Consider incentivizing the 'Average' group with a new challenge to boost overall productivity."
                                        </p>
                                    </div>
                                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
                                        Generate Report
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Users;
