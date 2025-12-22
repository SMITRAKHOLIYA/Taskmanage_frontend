import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

const Trash = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    useEffect(() => {
        fetchTrash();
    }, []);

    const fetchTrash = async () => {
        try {
            const response = await api.get('/tasks/trash');
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching trash", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        try {
            await api.put(`/tasks/${id}/restore`);
            fetchTrash();
        } catch (error) {
            console.error("Error restoring task", error);
            alert("Failed to restore task");
        }
    };

    const confirmForceDelete = (task) => {
        setTaskToDelete(task);
        setModalOpen(true);
    };

    const handleForceDelete = async () => {
        if (!taskToDelete) return;
        try {
            await api.delete(`/tasks/${taskToDelete.id}/force`);
            fetchTrash();
            setModalOpen(false);
            setTaskToDelete(null);
        } catch (error) {
            console.error("Error deleting task permanently", error);
            alert("Failed to delete task");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate mb-6">
                Trash Bin
            </h2>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {tasks.length === 0 && (
                        <li className="px-4 py-4 sm:px-6 text-gray-500 dark:text-gray-400 text-center">Trash is empty.</li>
                    )}
                    {tasks.map(task => (
                        <li key={task.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition duration-150 ease-in-out">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white truncate">{task.title}</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Deleted: {new Date(task.deleted_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleRestore(task.id)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                                    >
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => confirmForceDelete(task)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                                    >
                                        Delete Forever
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleForceDelete}
                title="Delete Permanently"
                message={`Are you sure you want to permanently delete "${taskToDelete?.title}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default Trash;
