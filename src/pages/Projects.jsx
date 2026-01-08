import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', members: [] });
    const [users, setUsers] = useState([]);
    const { user } = useContext(AuthContext);
    const { notify } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
        if (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner') {
            fetchUsers();
        }
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error("Error fetching projects", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', formData);
            setShowModal(false);
            setFormData({ title: '', description: '', members: [] });
            fetchProjects();
            notify.success('Project created successfully');
        } catch (error) {
            console.error("Error creating project", error);
            notify.error('Failed to create project');
        }
    };

    const handleMemberChange = (userId) => {
        setFormData(prev => {
            const currentMembers = prev.members;
            if (currentMembers.includes(userId)) {
                return { ...prev, members: currentMembers.filter(id => id !== userId) };
            } else {
                return { ...prev, members: [...currentMembers, userId] };
            }
        });
    };

    return (
        <div className="w-full p-2 md:p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Projects</h1>
                {(user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner') && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-blue-600 text-white font-bold shadow-lg hover:shadow-primary-600/30 transform hover:-translate-y-0.5 transition-all"
                    >
                        + New Project
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Array.isArray(projects) ? projects : []).map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 hover:border-primary-500/50 transition-colors group cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                                {project.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${project.status === 'active' ? 'bg-green-500/20 text-green-300' :
                                project.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                                    'bg-gray-500/20 text-gray-300'
                                }`}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-6 line-clamp-2">{project.description}</p>

                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${project.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-500 mt-4 border-t border-white/5 pt-4">
                            <div className="flex flex-col">
                                <span>Created by {project.creator_name}</span>
                                <span>{new Date(project.created_at).toLocaleDateString()}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/create-task?project_id=${project.id}`);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors flex items-center gap-1"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Task
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-[#0f1219] overflow-y-auto"
                    >
                        {/* Background Gradient Orbs */}
                        <div className="fixed inset-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[120px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
                        </div>

                        <div className="relative min-h-screen flex flex-col p-4 md:p-8">
                            {/* Close Button */}
                            <div className="flex justify-end mb-8">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Form Container with Glass Effect */}
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="w-full max-w-2xl">
                                    <div className="text-center mb-12">
                                        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
                                            Initiate New Project
                                        </h2>
                                        <p className="text-gray-400 text-lg">Define the parameters of your next breakthrough.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-8 backdrop-blur-xl bg-white/5 border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-primary-400 mb-2 uppercase tracking-wider">Project Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-600"
                                                    placeholder="Enter project name..."
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-primary-400 mb-2 uppercase tracking-wider">Description</label>
                                                <textarea
                                                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-600 min-h-[120px]"
                                                    placeholder="Describe the mission..."
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-primary-400 mb-2 uppercase tracking-wider">Assign Squad</label>
                                                <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 h-64 overflow-y-auto custom-scrollbar">
                                                    {(Array.isArray(users) ? users : []).map(u => (
                                                        <div
                                                            key={u.id}
                                                            onClick={() => handleMemberChange(u.id)}
                                                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all mb-2 ${formData.members.includes(u.id)
                                                                ? 'bg-gradient-to-r from-primary-600/20 to-blue-600/20 border border-primary-500/50'
                                                                : 'hover:bg-white/5 border border-transparent'
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-4 transition-all ${formData.members.includes(u.id)
                                                                ? 'bg-primary-500 border-primary-500 scale-110 shadow-lg shadow-primary-500/20'
                                                                : 'border-gray-600'
                                                                }`}>
                                                                {formData.members.includes(u.id) && (
                                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 flex justify-between items-center">
                                                                <div>
                                                                    <div className="text-white font-medium text-lg">{u.username}</div>
                                                                    <div className="text-xs text-gray-500 uppercase tracking-wide">{u.role}</div>
                                                                </div>
                                                                {formData.members.includes(u.id) && (
                                                                    <span className="text-primary-400 text-xs font-bold px-2 py-1 bg-primary-500/10 rounded-full">SELECTED</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-8 flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-sm"
                                            >
                                                Abort
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-primary-600/30 transform hover:-translate-y-1 transition-all uppercase tracking-widest text-sm"
                                            >
                                                Launch Project
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Projects;
