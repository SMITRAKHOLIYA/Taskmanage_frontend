import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const TaskInsights = ({ tasks = [] }) => {
    // Calculate Priority Breakdown
    const stats = useMemo(() => {
        const total = tasks.length;
        if (total === 0) return { high: 0, medium: 0, low: 0, urgent: [] };

        const high = tasks.filter(t => t.priority === 'high').length;
        const medium = tasks.filter(t => t.priority === 'medium').length;
        const low = tasks.filter(t => t.priority === 'low').length;

        // Urgent Deadlines (due within 48 hours and not completed)
        const now = new Date();
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(now.getDate() + 2);

        const urgent = tasks.filter(t => {
            if (!t.due_date || t.status === 'completed') return false;
            const dueDate = new Date(t.due_date);
            return dueDate <= twoDaysFromNow && dueDate >= now;
        }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).slice(0, 5);

        return {
            high: Math.round((high / total) * 100),
            medium: Math.round((medium / total) * 100),
            low: Math.round((low / total) * 100),
            highCount: high,
            mediumCount: medium,
            lowCount: low,
            urgent
        };
    }, [tasks]);

    if (tasks.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl text-center text-gray-400">
                <p>No task data available yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#a100ff] to-transparent opacity-20 blur-2xl"></div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#a100ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    Topic Distribution
                </h3>

                <div className="space-y-4">
                    {/* High Priority */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-red-400 font-medium">High Priority</span>
                            <span className="text-gray-400">{stats.highCount} Tasks ({stats.high}%)</span>
                        </div>
                        <div className="h-3 w-full bg-gray-700/50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.high}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]"
                            ></motion.div>
                        </div>
                    </div>

                    {/* Medium Priority */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-yellow-400 font-medium">Medium Priority</span>
                            <span className="text-gray-400">{stats.mediumCount} Tasks ({stats.medium}%)</span>
                        </div>
                        <div className="h-3 w-full bg-gray-700/50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.medium}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                            ></motion.div>
                        </div>
                    </div>

                    {/* Low Priority */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-green-400 font-medium">Low Priority</span>
                            <span className="text-gray-400">{stats.lowCount} Tasks ({stats.low}%)</span>
                        </div>
                        <div className="h-3 w-full bg-gray-700/50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.low}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                                className="h-full bg-gradient-to-r from-green-500 to-green-300 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                            ></motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Urgent Deadlines */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden"
            >
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#00f6ff] to-transparent opacity-20 blur-2xl"></div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#00f6ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Urgent & Upcoming
                </h3>

                <div className="space-y-3">
                    {stats.urgent.length > 0 ? (
                        stats.urgent.map(task => (
                            <div key={task.id} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#00f6ff]/30 transition-all cursor-default">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{task.title}</span>
                                    <span className="text-xs text-red-300 flex items-center mt-1">
                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Due: {task.due_date}
                                    </span>
                                </div>
                                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${task.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                            'bg-green-500/10 text-green-400 border-green-500/20'
                                    }`}>
                                    {task.priority}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <svg className="w-12 h-12 mb-3 text-green-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm">No urgent deadlines.</p>
                            <p className="text-xs opacity-60">You're all caught up!</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default TaskInsights;
