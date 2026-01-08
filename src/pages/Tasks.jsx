import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useSync } from '../context/SyncContext';
import { AnimatePresence } from 'framer-motion';

import ConfirmationModal from '../components/ConfirmationModal';
import TaskDetailsModal from '../components/TaskDetailsModal';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const { user } = useContext(AuthContext);
    const { notify } = useNotification();
    const { taskUpdateTrigger } = useSync();
    const navigate = useNavigate();

    // Filter & Sort State
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterProject, setFilterProject] = useState('');
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showCompleted, setShowCompleted] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Modal State
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Quick Add State
    const [quickTaskTitle, setQuickTaskTitle] = useState('');
    const [quickAdding, setQuickAdding] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [currentPage, filterStatus, filterPriority, filterProject, sortBy, sortOrder, searchQuery, showCompleted, taskUpdateTrigger]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error("Error fetching projects", error);
        }
    };

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: limit,
                status: filterStatus === 'all' ? '' : filterStatus,
                priority: filterPriority,
                project_id: filterProject,
                search: searchQuery,
                sort_by: sortBy,
                sort_order: sortOrder,
                exclude_status: (filterStatus === 'all' && !showCompleted) ? 'completed' : ''
            };

            const queryString = new URLSearchParams(params).toString();
            const response = await api.get(`/tasks?${queryString}`);

            if (response.data.data) {
                setTasks(response.data.data);
                setTotalPages(response.data.meta.total_pages);
                setTotalItems(response.data.meta.total_items);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error("Error fetching tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (e, id) => {
        e.stopPropagation();
        setTaskToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!taskToDelete) return;
        try {
            await api.delete(`/tasks/${taskToDelete}`);
            fetchTasks();
            setShowDeleteModal(false);
            setTaskToDelete(null);
        } catch (error) {
            alert('Failed to delete task');
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleQuickAdd = async (e) => {
        if (e.key === 'Enter' && quickTaskTitle.trim()) {
            setQuickAdding(true);
            try {
                // Default values for quick add
                const newTask = {
                    title: quickTaskTitle,
                    status: 'pending',
                    priority: 'medium'
                };
                await api.post('/tasks', newTask);
                setQuickTaskTitle('');
                notify('success', 'Task added successfully!');
                fetchTasks(); // Refresh list
            } catch (error) {
                console.error("Error adding quick task", error);
                notify('error', 'Failed to add task.');
            } finally {
                setQuickAdding(false);
            }
        }
    };

    const openTaskModal = (taskId) => {
        setSelectedTaskId(taskId);
        setIsModalOpen(true);
    };

    const handleTaskUpdate = () => {
        fetchTasks();
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
            />

            {/* Header & Create Button */}
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        All Tasks
                    </h2>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    {user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner') && (
                        <Link to="/create-task" className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 no-underline">
                            Create New Task
                        </Link>
                    )}
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg mb-6 transition-colors duration-200">
                {/* Quick Add Input */}
                <div className="mb-6">
                    <input
                        type="text"
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Quick Add: Type task title and press Enter..."
                        value={quickTaskTitle}
                        onChange={(e) => setQuickTaskTitle(e.target.value)}
                        onKeyDown={handleQuickAdd}
                        disabled={quickAdding}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                        <input
                            type="text"
                            className="block w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200"
                            placeholder="Search by title or description..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-colors duration-200"
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>

                    {/* Priority Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                        <select
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-colors duration-200"
                            value={filterPriority}
                            onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="">All Priorities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    {/* Project Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
                        <select
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-colors duration-200"
                            value={filterProject}
                            onChange={(e) => { setFilterProject(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="">All Projects</option>
                            {Array.isArray(projects) && projects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                        <div className="flex space-x-2">
                            <select
                                className="block w-full pl-3 pr-8 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-colors duration-200"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="created_at">Created Date</option>
                                <option value="due_date">Due Date</option>
                                <option value="priority">Priority</option>
                                <option value="assigned_to">Assigned User</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 transition-colors duration-200"
                                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>

                    {/* Show Completed Toggle */}
                    <div className="flex items-end pb-2">
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={showCompleted}
                                    onChange={() => { setShowCompleted(!showCompleted); setCurrentPage(1); }}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ${showCompleted ? 'bg-primary-500' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform ${showCompleted ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Show Completed
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md mb-6 transition-colors duration-200">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading tasks...</div>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {tasks.map(task => (
                            <li key={task.id}
                                onClick={() => openTaskModal(task.id)}
                                className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${task.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                            >
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex-1 min-w-0 w-full">
                                            <div className="text-lg font-medium text-primary-600 truncate">
                                                {task.title}
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                {task.description || <span className="italic text-gray-400">No description provided</span>}
                                            </p>
                                        </div>
                                        <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto space-y-0 sm:space-y-2 gap-2 sm:gap-0">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                                                ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                        task.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                            {task.is_extended == 1 && (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                    Extended
                                                </span>
                                            )}
                                            {user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner') && (
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Link
                                                        to={`/edit-task/${task.id}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-100"
                                                        title="Edit Task"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={(e) => confirmDelete(e, task.id)}
                                                        className="p-1 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-100"
                                                        title="Delete Task"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mr-6">
                                                <span className="font-medium mr-1">Priority:</span>
                                                <span className={`capitalize ${task.priority === 'high' ? 'text-red-600 font-semibold' :
                                                    task.priority === 'medium' ? 'text-yellow-600 font-semibold' :
                                                        'text-green-600 font-semibold'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </p>
                                            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mr-6">
                                                <span className="font-medium mr-1">Due:</span> {task.due_date || 'No date'}
                                            </p>
                                            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-medium mr-1">Assigned to:</span> {task.assigned_user_name || 'Unassigned'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {tasks.length === 0 && (
                            <li className="px-4 py-8 sm:px-6 text-gray-500 dark:text-gray-400 text-center">
                                No tasks found matching your filters.
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 rounded-lg shadow transition-colors duration-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(currentPage * limit, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="sr-only">Previous</span>
                                    &larr;
                                </button>
                                {/* Simple Page Numbers - can be improved for many pages */}
                                {(() => {
                                    const getPaginationRange = () => {
                                        const range = [];
                                        const delta = 1;

                                        if (totalPages <= 7) {
                                            for (let i = 1; i <= totalPages; i++) range.push(i);
                                        } else {
                                            let start = Math.max(2, currentPage - delta);
                                            let end = Math.min(totalPages - 1, currentPage + delta);

                                            if (currentPage <= 4) {
                                                end = 5;
                                            }
                                            if (currentPage >= totalPages - 3) {
                                                start = totalPages - 4;
                                            }

                                            range.push(1);
                                            if (start > 2) range.push('...');
                                            for (let i = start; i <= end; i++) range.push(i);
                                            if (end < totalPages - 1) range.push('...');
                                            range.push(totalPages);
                                        }
                                        return range;
                                    };

                                    return getPaginationRange().map((page, index) => (
                                        <button
                                            key={index}
                                            onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                            disabled={page === '...'}
                                            aria-current={currentPage === page ? 'page' : undefined}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === '...'
                                                ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-default'
                                                : currentPage === page
                                                    ? 'z-10 bg-primary-50 dark:bg-primary-900 border-primary-500 text-primary-600 dark:text-primary-200'
                                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ));
                                })()}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="sr-only">Next</span>
                                    &rarr;
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
            <AnimatePresence>
                {isModalOpen && selectedTaskId && (
                    <TaskDetailsModal
                        taskId={selectedTaskId}
                        onClose={() => setIsModalOpen(false)}
                        onUpdate={handleTaskUpdate}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tasks;
