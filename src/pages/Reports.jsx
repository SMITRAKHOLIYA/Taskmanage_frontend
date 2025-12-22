import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [period, setPeriod] = useState('weekly');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchReports(currentPage);
    }, [period, currentPage]);

    const fetchReports = async (page) => {
        try {
            setLoading(true);
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser ? storedUser.token : null;

            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await axios.get(`http://localhost:8000/api.php/reports?period=${period}&page=${page}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.data) {
                setReports(response.data.data);
                setTotalPages(response.data.meta.total_pages);
            } else {
                // Fallback for backward compatibility or if structure is different
                setReports(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">User Reports</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setPeriod('weekly')}
                        className={`px-4 py-2 rounded-lg transition-colors ${period === 'weekly'
                            ? 'bg-[#00f6ff] text-black font-bold'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setPeriod('monthly')}
                        className={`px-4 py-2 rounded-lg transition-colors ${period === 'monthly'
                            ? 'bg-[#00f6ff] text-black font-bold'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-gray-400 font-medium">User</th>
                                <th className="p-4 text-gray-400 font-medium">Role</th>
                                <th className="p-4 text-gray-400 font-medium">Joined</th>
                                <th className="p-4 text-gray-400 font-medium text-center">Points</th>
                                <th className="p-4 text-gray-400 font-medium text-center">Tasks Completed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">Loading...</td>
                                </tr>
                            ) : reports.length > 0 ? (
                                reports.map((report, index) => (
                                    <motion.tr
                                        key={report.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#00f6ff] to-[#a100ff] flex items-center justify-center text-white font-bold text-sm mr-3 shadow-lg">
                                                    {report.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{report.username}</div>
                                                    <div className="text-gray-400 text-xs">{report.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${report.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                                report.role === 'manager' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                                    'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                                }`}>
                                                {report.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-300 text-sm">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-[#00f6ff] font-bold font-mono text-lg drop-shadow-[0_0_5px_rgba(0,246,255,0.5)]">
                                                {report.points}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/10 text-white font-bold font-mono border border-white/20 group-hover:bg-[#a100ff] group-hover:border-[#a100ff] transition-all duration-300">
                                                {report.tasks_completed}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">No reports found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/5">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 1 || loading
                            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        Previous
                    </button>
                    <span className="text-gray-400 text-sm">
                        Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages || loading
                            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
