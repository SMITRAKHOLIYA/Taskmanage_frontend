import React, { useMemo } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

const DashboardCharts = ({ tasks = [] }) => {

    const statusData = useMemo(() => {
        if (!tasks.length) return [];
        const counts = { pending: 0, in_progress: 0, completed: 0, review: 0 };
        tasks.forEach(t => {
            const status = t.status.toLowerCase().replace(' ', '_');
            if (counts[status] !== undefined) counts[status]++;
            else if (status === 'in-progress') counts['in_progress']++;
        });
        return [
            { name: 'Pending', value: counts.pending },
            { name: 'In Progress', value: counts.in_progress },
            { name: 'Completed', value: counts.completed },
        ].filter(d => d.value > 0);
    }, [tasks]);

    const priorityData = useMemo(() => {
        if (!tasks.length) return [];
        const counts = { low: 0, medium: 0, high: 0 };
        tasks.forEach(t => {
            const priority = (t.priority || 'medium').toLowerCase();
            if (counts[priority] !== undefined) counts[priority]++;
        });
        return [
            { name: 'Low', value: counts.low, fill: '#4ade80' },
            { name: 'Medium', value: counts.medium, fill: '#facc15' },
            { name: 'High', value: counts.high, fill: '#f87171' },
        ];
    }, [tasks]);

    if (tasks.length === 0) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Status Distribution (Pie Chart) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-lg"
            >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Task Status Description</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', borderColor: '#374151', color: '#fff', borderRadius: '0.5rem' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Priority Breakdown (Bar Chart) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-lg"
            >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Task Priority Breakdown</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={priorityData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" horizontal={false} />
                            <XAxis type="number" stroke="#6b7280" className="dark:stroke-gray-400" />
                            <YAxis type="category" dataKey="name" stroke="#6b7280" className="dark:stroke-gray-400" width={60} />
                            <Tooltip
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', borderColor: '#374151', color: '#fff', borderRadius: '0.5rem' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {priorityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default DashboardCharts;
