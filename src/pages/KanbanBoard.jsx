
import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const KanbanBoard = () => {
    const { user } = useContext(AuthContext);
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [columnsData, setColumnsData] = useState({
        pending: { tasks: [], page: 1, total: 0, totalPages: 1, loading: false },
        in_progress: { tasks: [], page: 1, total: 0, totalPages: 1, loading: false },
        completed: { tasks: [], page: 1, total: 0, totalPages: 1, loading: false }
    });

    const LIMIT = 5; // Keep lists short as requested

    useEffect(() => {
        fetchColumnTasks('pending', 1);
        fetchColumnTasks('in_progress', 1);
        fetchColumnTasks('completed', 1);
    }, []);

    const fetchColumnTasks = async (status, page) => {
        setColumnsData(prev => ({
            ...prev,
            [status]: { ...prev[status], loading: true }
        }));

        try {
            const response = await api.get(`/tasks?status=${status}&page=${page}&limit=${LIMIT}`);
            setColumnsData(prev => ({
                ...prev,
                [status]: {
                    tasks: response.data.data,
                    page: page,
                    total: response.data.meta.total_items,
                    totalPages: response.data.meta.total_pages,
                    loading: false
                }
            }));
        } catch (error) {
            console.error(`Error fetching ${status} tasks`, error);
            setColumnsData(prev => ({
                ...prev,
                [status]: { ...prev[status], loading: false }
            }));
        }
    };

    const handlePageChange = (status, newPage) => {
        if (newPage >= 1 && newPage <= columnsData[status].totalPages) {
            fetchColumnTasks(status, newPage);
        }
    };

    const onDragStart = (e, taskId) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', taskId);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = async (e, newStatus) => {
        e.preventDefault();
        if (!draggedTaskId) return;

        // Find the task in the current state to check if it's actually moving columns
        let sourceStatus = null;
        let taskToMove = null;

        for (const status of ['pending', 'in_progress', 'completed']) {
            const found = columnsData[status].tasks.find(t => t.id === draggedTaskId);
            if (found) {
                sourceStatus = status;
                taskToMove = found;
                break;
            }
        }

        if (!taskToMove || sourceStatus === newStatus) {
            setDraggedTaskId(null);
            return;
        }

        setDraggedTaskId(null);

        // Optimistic UI update (optional, but tricky with pagination. Let's stick to reliable refetching for now)
        // To make it feel responsive, we could remove it from source immediately, but adding to target is hard without knowing sort order.
        // Let's just show loading state or rely on the fast API.

        try {
            await api.put(`/tasks/${taskToMove.id}`, {
                ...taskToMove,
                status: newStatus
            });

            // Refresh both source and target columns
            fetchColumnTasks(sourceStatus, columnsData[sourceStatus].page);
            fetchColumnTasks(newStatus, columnsData[newStatus].page);

        } catch (error) {
            console.error("Failed to update task status", error);
            alert("Failed to move task. Please try again.");
        }
    };

    const columns = [
        { id: 'pending', title: 'Pending', color: 'bg-yellow-500/10 border-yellow-500/20', titleColor: 'text-yellow-500' },
        { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500/10 border-blue-500/20', titleColor: 'text-blue-500' },
        { id: 'completed', title: 'Completed', color: 'bg-green-500/10 border-green-500/20', titleColor: 'text-green-500' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Board</h2>
                <Link to="/create-task" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
                    + New Task
                </Link>
            </div>

            <div className="flex md:grid md:grid-cols-3 gap-6 h-full pb-10 overflow-x-auto snap-x snap-mandatory md:snap-none">
                {columns.map(column => {
                    const data = columnsData[column.id];
                    return (
                        <div
                            key={column.id}
                            className={`flex-shrink-0 w-[85vw] md:w-auto snap-center flex flex-col h-full rounded-xl border ${column.color} backdrop-blur-sm`}
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, column.id)}
                        >
                            {/* Column Header */}
                            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                <h3 className={`font-bold ${column.titleColor} uppercase tracking-wider text-sm`}>
                                    {column.title}
                                </h3>
                                <span className="bg-white/10 text-gray-400 px-2 py-0.5 rounded text-xs font-mono">
                                    {data.total}
                                </span>
                            </div>

                            {/* Column Content */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar relative">
                                {data.loading && (
                                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                    </div>
                                )}

                                {data.tasks.map(task => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, task.id)}
                                        className="group relative bg-white dark:bg-[#1e2536] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 cursor-move hover:shadow-lg hover:border-primary-500/30 hover:-translate-y-1 transition-all duration-300"
                                    >
                                        {/* Priority Strip */}
                                        <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${task.priority === 'high' ? 'bg-red-500' :
                                            task.priority === 'medium' ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}></div>

                                        <div className="pl-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                                                    task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-green-500/10 text-green-500'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                                {task.assigned_user_name && (
                                                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm ring-2 ring-white dark:ring-[#1e2536]" title={`Assigned to ${task.assigned_user_name}`}>
                                                        {task.assigned_user_name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>

                                            <Link to={`/tasks/${task.id}`} className="block mb-1.5 font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-500 transition-colors line-clamp-2">
                                                {task.title}
                                            </Link>

                                            {task.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                                                    {task.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50 mt-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>{task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due date'}</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-gray-300 dark:text-gray-600 group-hover:text-primary-400 transition-colors">#{task.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {data.tasks.length === 0 && !data.loading && (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-700/30 rounded-lg">
                                        <p className="text-gray-500 text-sm">Drop tasks here</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination Footer */}
                            {data.totalPages > 1 && (
                                <div className="p-3 border-t border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-b-xl">
                                    <button
                                        onClick={() => handlePageChange(column.id, data.page - 1)}
                                        disabled={data.page === 1}
                                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        Page {data.page} of {data.totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(column.id, data.page + 1)}
                                        disabled={data.page === data.totalPages}
                                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default KanbanBoard;
