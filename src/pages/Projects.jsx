import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', members: [] });
    const [users, setUsers] = useState([]);
    const { user } = useContext(AuthContext);

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
        } catch (error) {
            alert('Failed to create project');
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
        <div className="p-6 max-w-7xl mx-auto">
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
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 hover:border-primary-500/50 transition-colors group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                                <Link to={`/projects/${project.id}`}>{project.title}</Link>
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

                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Created by {project.creator_name}</span>
                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

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
                                <h3 className="text-xl font-bold text-white mb-6">Create New Project</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                            value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                        <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                            rows="3"
                                            value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Assign Members</label>
                                        <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-48 overflow-y-auto custom-scrollbar">
                                            {users.map(u => (
                                                <div
                                                    key={u.id}
                                                    onClick={() => handleMemberChange(u.id)}
                                                    className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors mb-1 ${formData.members.includes(u.id)
                                                        ? 'bg-primary-600/20 border border-primary-500/30'
                                                        : 'hover:bg-white/5 border border-transparent'
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${formData.members.includes(u.id)
                                                        ? 'bg-primary-500 border-primary-500'
                                                        : 'border-gray-500'
                                                        }`}>
                                                        {formData.members.includes(u.id) && (
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm text-white font-medium">{u.username}</div>
                                                        <div className="text-xs text-gray-400">{u.role}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Click to select/deselect members</p>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium shadow-lg shadow-primary-600/20 transition-all">
                                        Create Project
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

export default Projects;
