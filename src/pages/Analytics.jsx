import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const Analytics = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ avgReliability: 0, highPerformers: 0, totalAnalyzed: 0 });
    const { user } = useContext(AuthContext);

    // Filter/Select Logic (default to first user or current user if found)
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/analytics?limit=100`); // Fetch more for better "average" calc
            const data = response.data.data;
            setReportData(data);

            if (data.length > 0) {
                // Determine Stats
                const avg = data.reduce((acc, curr) => acc + parseFloat(curr.reliability_index), 0) / data.length;
                const high = data.filter(d => parseFloat(d.reliability_index) >= 90).length;
                setStats({
                    avgReliability: avg.toFixed(1),
                    highPerformers: high,
                    totalAnalyzed: response.data.meta.total || data.length
                });

                // Default selection (try to find logged in user, else first)
                const currentUserStats = data.find(u => u.username === user.user.username) || data[0];
                setSelectedUser(currentUserStats);
            }
        } catch (error) {
            console.error("Error fetching analytics data", error);
        } finally {
            setLoading(false);
        }
    };

    // Transform Data for Radar Chart
    const getRadarData = () => {
        if (!selectedUser) return [];
        return [
            { subject: 'Time Discipline', A: parseFloat(selectedUser.time_discipline_score), B: 85, fullMark: 100 },
            { subject: 'Consistency', A: parseFloat(selectedUser.consistency_score), B: 80, fullMark: 100 },
            { subject: 'Responsibility', A: parseFloat(selectedUser.responsibility_score), B: 90, fullMark: 100 },
            { subject: 'Pressure Handling', A: parseFloat(selectedUser.pressure_handling_score), B: 75, fullMark: 100 },
            { subject: 'Task Efficiency', A: parseFloat(selectedUser.reliability_index), B: stats.avgReliability, fullMark: 100 },
            { subject: 'Focus', A: Math.min(100, parseFloat(selectedUser.reliability_index) * 1.1), B: 70, fullMark: 100 }, // Mock derived metric
        ];
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-[#00f6ff] animate-pulse font-mono text-xl">INITIALIZING ANALYTICS CORE...</div>;
    if (!user || !['admin', 'manager', 'owner'].includes(user.user.role)) return <div className="p-8 text-center text-red-500 font-mono">ACCESS DENIED</div>;

    return (
        <div className="min-h-screen p-4 md:p-8 text-white font-sans overflow-x-hidden relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow delay-75"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
                >
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00f6ff] via-white to-[#a100ff] drop-shadow-[0_0_10px_rgba(0,246,255,0.5)]">
                            NEXUS ANALYTICS
                        </h1>
                        <p className="text-gray-400 mt-2 font-mono text-sm tracking-widest uppercase">
                            // Real-time Performance Telemetry
                        </p>
                    </div>

                    {/* User Selector Dropdown (Futuristic style) */}
                    <div className="relative group">
                        <select
                            className="appearance-none bg-[#0a0f1c] border border-[#00f6ff]/30 text-[#00f6ff] py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-[#00f6ff] focus:ring-1 focus:ring-[#00f6ff] transition-all cursor-pointer font-mono text-sm shadow-[0_0_15px_rgba(0,246,255,0.1)]"
                            onChange={(e) => setSelectedUser(reportData.find(u => u.id === parseInt(e.target.value)))}
                            value={selectedUser?.id || ''}
                        >
                            {reportData.map(u => <option key={u.id} value={u.id}>{u.username.toUpperCase()}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#00f6ff]"><svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0.5L5 5.5L10 0.5H0Z" /></svg></div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN: Productivity Ring & Quick Stats */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Productivity Pulse Ring Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00f6ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <h2 className="text-[#00f6ff] font-mono text-sm tracking-widest mb-6 glow-text text-center">PRODUCTIVITY PULSE</h2>

                            {/* The Pulse Ring */}
                            <div className="relative w-64 h-64 flex items-center justify-center">
                                {/* Outer Glow Ring */}
                                <div className="absolute inset-0 rounded-full border border-[#00f6ff]/20 animate-spin-slow-reverse"></div>
                                <div className="absolute inset-4 rounded-full border border-dashed border-[#a100ff]/30 animate-spin-slow"></div>

                                {/* SVG Circle Progress */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="128" cy="128" r="110" stroke="#1a1f2e" strokeWidth="12" fill="none" />
                                    <circle
                                        cx="128" cy="128" r="110"
                                        stroke="url(#pulseGradient)"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeDasharray="691"
                                        strokeDashoffset={691 - (691 * (selectedUser?.reliability_index || 0)) / 100}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(0,246,255,0.6)]"
                                    />
                                    <defs>
                                        <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#00f6ff" />
                                            <stop offset="100%" stopColor="#a100ff" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Center Content */}
                                <div className="absolute flex flex-col items-center justify-center text-center">
                                    <span className="text-6xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                        {Math.round(selectedUser?.reliability_index || 0)}
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono mt-1">RELIABILITY INDEX</span>
                                </div>
                            </div>

                            {/* Status Indicator */}
                            <div className="mt-8 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
                                <span className="flex items-center gap-2 text-sm font-bold">
                                    <span className={`w-2 h-2 rounded-full ${parseFloat(selectedUser?.reliability_index) > 80 ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                                    STATUS: {parseFloat(selectedUser?.reliability_index) > 80 ? 'OPTIMAL' : 'STABLE'}
                                </span>
                            </div>
                        </motion.div>

                        {/* Quick Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-[#1a1f2e]/80 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center"
                            >
                                <span className="text-[#a100ff] text-2xl font-bold font-mono">{selectedUser?.consistency_score}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Consistency</span>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-[#1a1f2e]/80 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center"
                            >
                                <span className="text-[#00f6ff] text-2xl font-bold font-mono">{selectedUser?.time_discipline_score}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Time Mgmt.</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: The "Skill Matrix" Radar Chart */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-8 h-full min-h-[500px] flex flex-col relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6 z-10">
                                <h2 className="text-white text-xl font-bold font-mono border-l-4 border-[#00f6ff] pl-3">
                                    PERFORMANCE MATRIX (Hexagon Scan)
                                </h2>
                                <div className="flex gap-4 text-xs font-mono">
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#00f6ff]/50 border border-[#00f6ff] rounded-sm"></span> {selectedUser?.username}</div>
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#a100ff]/30 border border-[#a100ff] rounded-sm"></span> Team Avg</div>
                                </div>
                            </div>

                            {/* Recharts Radar Chart */}
                            <div className="flex-1 w-full h-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData()}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                                        <PolarAngleAxis
                                            dataKey="subject"
                                            tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: 'monospace' }}
                                        />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

                                        {/* Reference (Average) Layer */}
                                        <Radar
                                            name="Team Average"
                                            dataKey="B"
                                            stroke="#a100ff"
                                            strokeWidth={2}
                                            fill="#a100ff"
                                            fillOpacity={0.2}
                                        />

                                        {/* User Layer (The "Main" one) */}
                                        <Radar
                                            name={selectedUser?.username}
                                            dataKey="A"
                                            stroke="#00f6ff"
                                            strokeWidth={3}
                                            fill="#00f6ff"
                                            fillOpacity={0.4}
                                            className="filter drop-shadow-[0_0_8px_rgba(0,246,255,0.5)]"
                                        />

                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#0a0f1c', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom: Team Velocity / Table (Modernized) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[#1a1f2e]/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md"
                >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white font-mono">TEAM VELOCITY DATA</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-gray-500 font-mono border-b border-white/5">
                                    <th className="p-4">OPERATOR</th>
                                    <th className="p-4">RELIABILITY</th>
                                    <th className="p-4">DISCIPLINE</th>
                                    <th className="p-4">RESPONSIBILITY</th>
                                    <th className="p-4">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((row, i) => (
                                    <tr
                                        key={row.id}
                                        onClick={() => setSelectedUser(row)}
                                        className={`cursor-pointer transition-colors duration-200 ${selectedUser?.id === row.id ? 'bg-[#00f6ff]/10' : 'hover:bg-white/5'}`}
                                    >
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center font-bold text-xs">
                                                {row.username.charAt(0)}
                                            </div>
                                            <span className="font-medium text-sm text-gray-300">{row.username}</span>
                                        </td>
                                        <td className="p-4 font-mono text-[#00f6ff]">{row.reliability_index}</td>
                                        <td className="p-4 text-sm text-gray-400">{row.time_discipline_score}</td>
                                        <td className="p-4 text-sm text-gray-400">{row.responsibility_score}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${parseFloat(row.reliability_index) > 80 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                                {parseFloat(row.reliability_index) > 80 ? 'ACTIVE' : 'WARNING'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            <style>{`
                .animate-pulse-slow { animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .animate-spin-slow { animation: spin 12s linear infinite; }
                .animate-spin-slow-reverse { animation: spin 15s linear infinite reverse; }
                .glow-text { text-shadow: 0 0 10px rgba(0, 246, 255, 0.5); }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Analytics;
