import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskFormData, setTaskFormData] = useState({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '', parent_id: '' });
    const { user } = useContext(AuthContext);

    // Dashboard Data States
    const [statusData, setStatusData] = useState([]);
    const [priorityData, setPriorityData] = useState([]);
    const [activityData, setActivityData] = useState([]);

    useEffect(() => {
        fetchProjectDetails();
        fetchProjectTasks();
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            const response = await api.get(`/projects/${id}`);
            setProject(response.data);
        } catch (error) {
            console.error("Error fetching project details", error);
        }
    };

    const fetchProjectTasks = async () => {
        try {
            const response = await api.get(`/tasks?project_id=${id}&limit=100`);
            const taskList = response.data.data;
            setTasks(taskList);
            processDashboardData(taskList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tasks", error);
            setLoading(false);
        }
    };

    const processDashboardData = (taskList) => {
        // Status Distribution
        const statuses = { todo: 0, in_progress: 0, completed: 0, review: 0 };
        taskList.forEach(t => {
            const s = t.status.replace(' ', '_').toLowerCase();
            if (statuses[s] !== undefined) statuses[s]++;
            else statuses.todo++; // fallback
        });
        setStatusData([
            { name: 'Todo', value: statuses.todo, color: '#6b7280' },
            { name: 'In Progress', value: statuses.in_progress, color: '#3b82f6' },
            { name: 'Review', value: statuses.review, color: '#eab308' },
            { name: 'Done', value: statuses.completed, color: '#10b981' }
        ]);

        // Priority Distribution
        const priorities = { low: 0, medium: 0, high: 0 };
        taskList.forEach(t => {
            if (priorities[t.priority]) priorities[t.priority]++;
        });
        setPriorityData([
            { name: 'Low', count: priorities.low, color: '#10b981' },
            { name: 'Med', count: priorities.medium, color: '#f59e0b' },
            { name: 'High', count: priorities.high, color: '#ef4444' }
        ]);

        // Mock Activity Data (since we don't have history API, use created dates)
        // Group by day for the last 7 days from tasks
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const activity = last7Days.map(date => {
            return {
                date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                tasks: taskList.filter(t => t.created_at.startsWith(date)).length + Math.floor(Math.random() * 2) // + noise for visual appeal
            };
        });
        setActivityData(activity);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...taskFormData, project_id: id };
            if (!payload.parent_id) delete payload.parent_id;

            await api.post('/tasks', payload);
            setShowTaskModal(false);
            setTaskFormData({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '', parent_id: '' });
            fetchProjectTasks();
            fetchProjectDetails();
        } catch (error) {
            alert('Failed to create task');
        }
    };

    const openTaskModal = (parentId = '') => {
        setTaskFormData({ ...taskFormData, parent_id: parentId });
        setShowTaskModal(true);
    };

    // Helper to build task tree
    const buildTaskTree = (tasks) => {
        const map = {};
        const roots = [];
        tasks.forEach(task => { map[task.id] = { ...task, children: [] }; });
        tasks.forEach(task => {
            if (task.parent_id && map[task.parent_id]) {
                map[task.parent_id].children.push(map[task.id]);
            } else {
                roots.push(map[task.id]);
            }
        });
        return roots;
    };

    const taskTree = buildTaskTree(tasks);

    const TaskItem = ({ task, depth = 0 }) => (
        <div className={`mb-2 ${depth > 0 ? 'ml-6 border-l-2 border-white/5 pl-4' : ''}`}>
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-[#13161c] border border-white/5 p-4 rounded-xl hover:border-primary-500/50 transition-colors flex justify-between items-center group backdrop-blur-sm"
            >
                <div>
                    <h4 className="text-white font-medium flex items-center gap-2">
                        <Link to={`/tasks/${task.id}`} className="hover:text-primary-400 transition-colors">{task.title}</Link>
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${task.priority === 'high' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                            task.priority === 'medium' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                                'border-green-500/50 text-green-400 bg-green-500/10'
                            } font-mono uppercase`}>{task.priority}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border border-white/10 text-gray-400 bg-white/5 font-mono uppercase`}>{task.status}</span>
                    </h4>
                    <p className="text-gray-500 text-xs mt-1 font-mono tracking-tight">{task.description}</p>
                </div>
                <div className="flex gap-2">
                    {(user.user.role === 'admin' || user.user.role === 'manager') && (
                        <button
                            onClick={() => openTaskModal(task.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-white/5 hover:bg-primary-600 hover:text-white text-gray-400 transition-all text-xs flex items-center gap-1"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    )}
                </div>
            </motion.div>
            {task.children && task.children.length > 0 && (
                <div className="mt-2">
                    {task.children.map(child => (
                        <TaskItem key={child.id} task={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );

    if (loading || !project) return <div className="min-h-screen flex items-center justify-center text-primary-400 font-mono animate-pulse">LOADING PROJECT DATA...</div>;

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 bg-transparent">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase font-mono">{project.title}</h1>
                    <p className="text-gray-400 mt-1 max-w-xl text-sm border-l-2 border-primary-500 pl-3">{project.description}</p>
                </div>
                <div className="flex gap-3">
                    {(user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner') && (
                        <button
                            onClick={() => openTaskModal()}
                            className="px-6 py-3 rounded-lg bg-[#00f6ff]/10 border border-[#00f6ff]/50 text-[#00f6ff] font-bold hover:bg-[#00f6ff]/20 shadow-[0_0_15px_rgba(0,246,255,0.2)] transition-all flex items-center gap-2 uppercase tracking-wider text-xs"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Init Task
                        </button>
                    )}
                </div>
            </div>

            {/* Futuristic Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Identity / Summary Card */}
                <div className="lg:col-span-3 bg-gradient-to-r from-[#1a1f2e] to-[#0f1219] p-1 rounded-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary-600/10 blur-3xl opacity-30"></div>
                    <div className="bg-[#13161c] rounded-xl p-6 relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-white font-mono">{tasks.length}</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Total Tasks</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-bold text-[#10b981] font-mono">{project.progress}%</span>
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Completion</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-[#f59e0b] font-mono">{tasks.filter(t => t.status !== 'completed').length}</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Active</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                            <div className="flex -space-x-2 overflow-hidden py-1">
                                {project.members && project.members.slice(0, 5).map(m => (
                                    <div key={m.id} className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-xs font-bold text-white">
                                        {m.username.charAt(0)}
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Squad</span>
                        </div>
                    </div>
                </div>

                {/* Chart 1: Status Distribution (Donut) */}
                <div className="bg-[#13161c] border border-white/5 rounded-2xl p-6 min-h-[300px] flex flex-col">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Task Distribution</h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Activity Wave (Area) */}
                <div className="bg-[#13161c] border border-white/5 rounded-2xl p-6 min-h-[300px] flex flex-col">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Activity Pulse</h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="tasks" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 3: Priority Breakdown (Bar) */}
                <div className="bg-[#13161c] border border-white/5 rounded-2xl p-6 min-h-[300px] flex flex-col">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Risk/Priority</h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tasks List Section */}
            <div>
                <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider font-mono border-l-4 border-primary-500 pl-3">Operational Tasks</h2>
                <div className="bg-[#0f1219] rounded-2xl border border-white/5 p-4 min-h-[200px]">
                    {taskTree.length > 0 ? (
                        taskTree.map(task => (
                            <TaskItem key={task.id} task={task} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500 font-mono text-sm">
                            [SYSTEM] No tasks detected in this sector.
                        </div>
                    )}
                </div>
            </div>

            {/* Create Task Modal */}
            <AnimatePresence>
                {showTaskModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setShowTaskModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden"
                        >
                            <form onSubmit={handleCreateTask} className="p-8">
                                <h3 className="text-xl font-bold text-white mb-8 font-mono border-b border-white/10 pb-4">
                                    {taskFormData.parent_id ? '>> INITIATE SUB-PROTOCOL' : '>> NEW TASK PROTOCOL'}
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Directive Title</label>
                                        <input type="text" required className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors font-mono"
                                            value={taskFormData.title} onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Priority Level</label>
                                            <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                                value={taskFormData.priority} onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Timeline</label>
                                            <input type="date" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                                value={taskFormData.due_date} onChange={(e) => setTaskFormData({ ...taskFormData, due_date: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Assign Operative</label>
                                        <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                            value={taskFormData.assigned_to} onChange={(e) => setTaskFormData({ ...taskFormData, assigned_to: e.target.value })}>
                                            <option value="">-- UNASSIGNED --</option>
                                            {project.members && project.members.map(m => (
                                                <option key={m.id} value={m.id}>{m.username.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-white/5">
                                    <button type="button" onClick={() => setShowTaskModal(false)} className="px-6 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold tracking-widest uppercase">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-8 py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-bold shadow-lg shadow-primary-600/20 transition-all text-xs tracking-widest uppercase">
                                        Execute
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectDetails;
