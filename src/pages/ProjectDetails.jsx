import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskFormData, setTaskFormData] = useState({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '', parent_id: '' });
    const { user } = useContext(AuthContext);

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
            const response = await api.get(`/tasks?project_id=${id}&limit=100`); // Fetch enough tasks
            setTasks(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tasks", error);
            setLoading(false);
        }
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
            fetchProjectDetails(); // Update progress
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

        tasks.forEach(task => {
            map[task.id] = { ...task, children: [] };
        });

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
        <div className={`mb-2 ${depth > 0 ? 'ml-6 border-l-2 border-gray-700 pl-4' : ''}`}>
            <div className="bg-[#1a1f2e] border border-white/10 p-4 rounded-xl hover:border-primary-500/50 transition-colors flex justify-between items-center group">
                <div>
                    <h4 className="text-white font-medium flex items-center gap-2">
                        <Link to={`/tasks/${task.id}`} className="hover:text-primary-400">{task.title}</Link>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-green-500/20 text-green-300'
                            }`}>{task.priority}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${task.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                            }`}>{task.status}</span>
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">{task.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Assigned to: {task.assigned_user_name || 'Unassigned'}</span>
                        <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                    </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(user.user.role === 'admin' || user.user.role === 'manager') && (
                        <button
                            onClick={() => openTaskModal(task.id)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs"
                        >
                            + Sub-task
                        </button>
                    )}
                </div>
            </div>
            {task.children && task.children.length > 0 && (
                <div className="mt-2">
                    {task.children.map(child => (
                        <TaskItem key={child.id} task={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );

    if (loading || !project) return <div className="p-6 text-white">Loading...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-3xl font-bold text-white">{project.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${project.status === 'active' ? 'bg-green-500/20 text-green-300' :
                                project.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                                    'bg-gray-500/20 text-gray-300'
                                }`}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-gray-400 max-w-2xl">{project.description}</p>
                    </div>
                    {(user.user.role === 'admin' || user.user.role === 'manager') && (
                        <button
                            onClick={() => openTaskModal()}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-blue-600 text-white font-bold shadow-lg hover:shadow-primary-600/30 transform hover:-translate-y-0.5 transition-all"
                        >
                            + Add Task
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Progress</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${project.progress}%` }}
                                ></div>
                            </div>
                            <span className="text-white font-bold">{project.progress}%</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Members</h3>
                        <div className="flex -space-x-2">
                            {project.members && project.members.map((member, i) => (
                                <div key={member.id} className="h-8 w-8 rounded-full bg-gray-700 border-2 border-[#1a1f2e] flex items-center justify-center text-xs text-white font-bold" title={member.username}>
                                    {member.username.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {(!project.members || project.members.length === 0) && <span className="text-gray-500 text-sm">No members</span>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Details</h3>
                        <div className="text-sm text-gray-400">
                            <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
                            <p>By: {project.creator_name || 'Unknown'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Tasks</h2>
                <div className="space-y-4">
                    {taskTree.length > 0 ? (
                        taskTree.map(task => (
                            <TaskItem key={task.id} task={task} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500 bg-[#1a1f2e] rounded-2xl border border-white/5">
                            No tasks found in this project.
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
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowTaskModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <form onSubmit={handleCreateTask} className="p-6">
                                <h3 className="text-xl font-bold text-white mb-6">
                                    {taskFormData.parent_id ? 'Add Sub-task' : 'Add New Task'}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                            value={taskFormData.title} onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                        <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                            rows="3"
                                            value={taskFormData.description} onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                                value={taskFormData.priority} onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                                            <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                                value={taskFormData.due_date} onChange={(e) => setTaskFormData({ ...taskFormData, due_date: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Assign To</label>
                                        <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-32 overflow-y-auto custom-scrollbar">
                                            {project.members && project.members.map(m => (
                                                <div
                                                    key={m.id}
                                                    onClick={() => setTaskFormData({ ...taskFormData, assigned_to: m.id })}
                                                    className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors mb-1 ${Number(taskFormData.assigned_to) === Number(m.id)
                                                        ? 'bg-primary-600/20 border border-primary-500/30'
                                                        : 'hover:bg-white/5 border border-transparent'
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 transition-colors ${Number(taskFormData.assigned_to) === Number(m.id)
                                                        ? 'bg-primary-500 border-primary-500'
                                                        : 'border-gray-500'
                                                        }`}>
                                                        {Number(taskFormData.assigned_to) === Number(m.id) && (
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-white">{m.username}</span>
                                                </div>
                                            ))}
                                            {(!project.members || project.members.length === 0) && (
                                                <div className="text-gray-500 text-sm text-center py-4">No members in project</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium shadow-lg shadow-primary-600/20 transition-all">
                                        Create Task
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
