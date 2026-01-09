import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import Modal from '../Modal';
import { useNotification } from '../../context/NotificationContext';
import { useForm } from 'react-hook-form';

const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { notify } = useNotification();
    const navigate = useNavigate();

    // Form for creating group
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const res = await api.get('/customer-groups');
            setGroups(res.data);
        } catch (error) {
            console.error("Error fetching groups", error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            await api.post('/customer-groups', { name: data.name });
            notify.success("Group created successfully");
            setIsModalOpen(false);
            reset();
            fetchGroups();
        } catch (error) {
            console.error("Create group error", error);
            notify.error("Failed to create group");
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent navigation
        if (!window.confirm("Are you sure? All members in this group will be deleted.")) return;
        try {
            await api.delete(`/customer-groups/${id}`);
            notify.success("Group deleted");
            fetchGroups();
        } catch (error) {
            console.error("Delete error", error);
            notify.error("Failed to delete group");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Groups</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create Group
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center text-gray-500 py-8">Loading groups...</div>
                ) : groups.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-8">No groups found.</div>
                ) : (
                    groups.map((group) => (
                        <motion.div
                            key={group.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => navigate(`/customer-groups/${group.id}`)}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer relative group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{group.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Created: {new Date(group.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={(e) => handleDelete(group.id, e)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium z-10"
                                >
                                    Delete Group
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create Group Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Group">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name *</label>
                        <input
                            {...register('name', { required: 'Group Name is required' })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter Group Name"
                        />
                        {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSubmit(onSubmit)}
                            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow-lg transition-all"
                        >
                            Create
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GroupList;
