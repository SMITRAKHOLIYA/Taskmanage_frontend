import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api';
import Dashboard from './Dashboard';
import DashboardCharts from '../components/DashboardCharts';

const OwnerDashboard = () => {
    const [stats, setStats] = useState({ companies: 0, users: 0 });
    const [companies, setCompanies] = useState([]);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchCompanies();
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            // Fetch tasks for analytics (admin/owner view typically sees all or scoped)
            const res = await api.get('/tasks?limit=1000'); // Get enough for stats
            setTasks(res.data.data || []);
        } catch (error) {
            console.error("Error fetching tasks for dashboard", error);
        }
    };

    const fetchStats = async () => {
        // Placeholder for real stats if we had a stats endpoint
    };

    const fetchCompanies = async () => {
        try {
            const res = await api.get('/companies');
            setCompanies(res.data);
            setStats(prev => ({ ...prev, companies: res.data.length }));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="w-full p-2 md:p-6 space-y-6 md:space-y-8">
            <header className="mb-6 md:mb-8">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                >
                    Owner Dashboard
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base"
                >
                    System overview and management
                </motion.p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-lg relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-24 h-24 text-primary-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Companies</h3>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.companies}</p>
                    <div className="mt-4 flex items-center text-sm text-green-500 dark:text-green-400">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        <span>Active System Wide</span>
                    </div>
                </motion.div>
            </div>

            {/* Dashboard Charts (New) */}
            <DashboardCharts tasks={tasks} />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/companies" className="block group">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-600/20 dark:to-blue-400/10 border border-blue-200 dark:border-blue-500/30 p-8 rounded-2xl shadow-lg relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Manage Companies</h3>
                                <p className="text-gray-600 dark:text-gray-400">Create, update, and manage company tenants.</p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                        </div>
                    </motion.div>
                </Link>
                <Link to="/users" className="block group">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-600/20 dark:to-purple-400/10 border border-purple-200 dark:border-purple-500/30 p-8 rounded-2xl shadow-lg relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Global User Management</h3>
                                <p className="text-gray-600 dark:text-gray-400">Manage admins, managers, and users across companies.</p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                        </div>
                    </motion.div>
                </Link>
            </div>

            {/* Admin Dashboard Features */}
            <div className="border-t border-gray-200 dark:border-white/10 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Operational Overview</h2>
                <Dashboard showTitle={false} />
            </div>

            {/* Recent Companies Table */}
            <div className="bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Companies</h3>
                    <button onClick={fetchCompanies} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Industry</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                            {companies.map((company) => (
                                <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                {company.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{company.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{company.industry || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${company.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30' : 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-200 dark:border-gray-500/30'}`}>
                                            {company.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(company.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
