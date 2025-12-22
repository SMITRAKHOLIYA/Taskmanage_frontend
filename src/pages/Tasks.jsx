import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import ConfirmationModal from '../components/ConfirmationModal';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const { user } = useContext(AuthContext);

    // Filter & Sort State
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchTasks();
    }, [currentPage, filterStatus, filterPriority, sortBy, sortOrder, searchQuery]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: limit,
                status: filterStatus === 'all' ? '' : filterStatus,
                priority: filterPriority,
                search: searchQuery,
                sort_by: sortBy,
                sort_order: sortOrder
            };

            // Convert params to query string
            const queryString = new URLSearchParams(params).toString();
            const response = await api.get(`/tasks?${queryString}`);

            if (response.data.data) {
                setTasks(response.data.data);
                setTotalPages(response.data.meta.total_pages);
                setTotalItems(response.data.meta.total_items);
            } else {
                // Fallback for old API structure if needed, though we updated it
                setTasks([]);
            }
        } catch (error) {
            console.error("Error fetching tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id) => {
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
        setCurrentPage(1); // Reset to first page on search
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                </div>
            </div>

            {/* Task List */}
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md mb-6 transition-colors duration-200">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading tasks...</div>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {tasks.map(task => (
                            <li key={task.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/tasks/${task.id}`} className="text-lg font-medium text-primary-600 truncate hover:text-primary-500 no-underline">
                                                {task.title}
                                            </Link>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                {task.description || <span className="italic text-gray-400">No description provided</span>}
                                            </p>
                                        </div>
                                        <div className="ml-4 flex-shrink-0 flex flex-col items-end space-y-2">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                                                ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                        task.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                            {task.is_extended == 1 && (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                    Extended
                                                </span>
                                            )}
                                            {user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner') && (
                                                <button
                                                    onClick={() => confirmDelete(task.id)}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    Delete
                                                </button>
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
        </div>
    );
};

export default Tasks;
