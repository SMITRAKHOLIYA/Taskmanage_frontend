import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';
import Calendar from '../components/Calendar';
import Modal from '../components/Modal';
import TaskInsights from '../components/TaskInsights';
import TaskDetailsModal from '../components/TaskDetailsModal';
import { AnimatePresence } from 'framer-motion';

const Dashboard = ({ showTitle = true }) => {
    const [recentTasks, setRecentTasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDateTasks, setSelectedDateTasks] = useState([]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const { user } = useContext(AuthContext);

    // Task Modal State
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const handleTaskClick = (task) => {
        setSelectedTaskId(task.id);
        setIsTaskModalOpen(true);
    };

    const handleCloseTaskModal = () => {
        setIsTaskModalOpen(false);
        setSelectedTaskId(null);
    };

    const handleTaskUpdate = async () => {
        // Refresh recent tasks
        try {
            const tasksResponse = await api.get('/tasks?limit=5&sort_by=created_at&sort_order=desc');
            setRecentTasks(tasksResponse.data.data || []);
        } catch (error) {
            console.error("Error refreshing tasks", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Trigger Recurring Task Generation (Lazy Automation)
                if (user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner')) {
                    api.post('/recurring-tasks/generate').catch(err => console.error("Auto-generation failed", err));
                }

                // Fetch Recent Tasks (Limit 5, newest first)
                const tasksResponse = await api.get('/tasks?limit=5&sort_by=created_at&sort_order=desc');
                const tasks = tasksResponse.data.data || [];

                setRecentTasks(tasks);

                // For calendar, we still need all tasks (or a range). 
                // For now, let's fetch a larger batch for the calendar if needed, 
                // or ideally implement a calendar endpoint. 
                // To keep it simple and scalable for now, we'll fetch 100 for calendar/allTasks 
                // but separate from the critical dashboard load if possible.
                // Re-using the limit=100 for calendar data for now as a compromise, 
                // but the stats are now safe.
                const allTasksResponse = await api.get('/tasks?limit=100');
                const allTasksData = allTasksResponse.data.data || [];
                setAllTasks(allTasksData);
                updateSelectedDateTasks(new Date(), allTasksData);

            } catch (error) {
                console.error("Error fetching dashboard data", error);
            }
        };

        fetchData();
    }, [user]);

    const updateSelectedDateTasks = (date, tasksToFilter = allTasks) => {
        const dateString = date.toISOString().split('T')[0];
        const tasksForDate = tasksToFilter.filter(task => {
            if (!task.due_date) return false;
            return task.due_date.startsWith(dateString);
        });
        setSelectedDateTasks(tasksForDate);
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        updateSelectedDateTasks(date);
    };


    // Calculate stats client-side from allTasks to avoid backend dependency issues
    const stats = React.useMemo(() => {
        const total = allTasks.length;
        const pending = allTasks.filter(t => t.status === 'pending').length;
        const in_progress = allTasks.filter(t => t.status === 'in_progress').length;
        const completed = allTasks.filter(t => t.status === 'completed').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, pending, in_progress, completed, completionRate };
    }, [allTasks]);

    const usernameDisplay = user?.user?.username || 'User';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="py-4 md:py-6">
            <div className="w-full px-2 sm:px-6 lg:px-8">
                {/* Productivity Hero Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 text-white shadow-2xl mb-8">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-gradient-to-br from-[#00f6ff] to-[#a100ff] opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-gradient-to-br from-[#a100ff] to-[#00f6ff] opacity-20 blur-3xl"></div>

                    <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:items-center">
                        <div>
                            <div className="flex items-center space-x-2 text-sm font-medium text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{today}</span>
                            </div>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f6ff] to-[#a100ff]">{usernameDisplay}</span>!
                            </h2>
                            <p className="mt-4 text-lg text-gray-300">
                                You have <span className="font-semibold text-white">{stats.pending} pending</span> tasks and <span className="font-semibold text-white">{stats.in_progress} in progress</span> today.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-4">
                                {user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner') && (
                                    <Link
                                        to="/create-task"
                                        className="inline-flex items-center rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 border border-white/10"
                                    >
                                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create New Task
                                    </Link>
                                )}
                                <button
                                    onClick={() => setIsCalendarOpen(true)}
                                    className="inline-flex items-center rounded-xl bg-[#00f6ff]/10 px-6 py-3 text-sm font-medium text-[#00f6ff] backdrop-blur-sm transition-all hover:bg-[#00f6ff]/20 border border-[#00f6ff]/20"
                                >
                                    View Calendar
                                </button>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/5 p-6 backdrop-blur-md border border-white/10">
                            <h3 className="text-lg font-medium text-white">Productivity Score</h3>
                            <div className="mt-4 flex items-end justify-between">
                                <span className="text-4xl font-bold text-white">{stats.completionRate}%</span>
                                <span className="text-sm text-gray-400">Completion Rate</span>
                            </div>
                            <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-gray-700">
                                <div
                                    className="h-full bg-gradient-to-r from-[#00f6ff] to-[#a100ff] transition-all duration-1000 ease-out"
                                    style={{ width: `${stats.completionRate}%` }}
                                ></div>
                            </div>
                            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                                    <div className="text-xs text-gray-400">Total</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
                                    <div className="text-xs text-gray-400">Done</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-400">{stats.pending + stats.in_progress}</div>
                                    <div className="text-xs text-gray-400">Active</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Recent Tasks</h3>
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200 mb-8">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentTasks.map(task => (
                            <li key={task.id}>
                                <div
                                    onClick={() => handleTaskClick(task)}
                                    className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                                >
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-primary-600 truncate">
                                                {task.title}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {(task.status || 'pending').replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mr-4">
                                                    Due: {task.due_date || 'No date'}
                                                </p>
                                                <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    By: {task.creator_name || 'Admin'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {recentTasks.length === 0 && (
                            <li className="px-4 py-4 sm:px-6 text-gray-500 dark:text-gray-400 text-center">No recent tasks found.</li>
                        )}
                    </ul>
                </div>

                {user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner') && (
                    <div className="mt-8">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Task Insights</h3>
                        <div className="mb-8">
                            <TaskInsights tasks={allTasks} />
                        </div>
                    </div>
                )}

                <Modal
                    isOpen={isCalendarOpen}
                    onClose={() => setIsCalendarOpen(false)}
                    title="Task Calendar"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <Calendar tasks={allTasks} onDateClick={handleDateClick} />
                        </div>
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                                Tasks for {selectedDate.toLocaleDateString()}
                            </h3>
                            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200 h-full max-h-[400px] overflow-y-auto border border-gray-200 dark:border-gray-700">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {selectedDateTasks.map(task => (
                                        <li key={task.id}>
                                            <div
                                                className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                                                onClick={() => {
                                                    setIsCalendarOpen(false);
                                                    handleTaskClick(task);
                                                }}
                                            >
                                                <div className="px-4 py-4 sm:px-6">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-primary-600 truncate">
                                                            {task.title}
                                                        </p>
                                                        <div className="ml-2 flex-shrink-0 flex">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                                {task.status.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 sm:flex sm:justify-between">
                                                        <div className="sm:flex">
                                                            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                                Due: {task.due_date || 'No date'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                    {selectedDateTasks.length === 0 && (
                                        <li className="px-4 py-8 sm:px-6 text-gray-500 dark:text-gray-400 text-center flex flex-col items-center justify-center h-full">
                                            <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <p>No tasks for this date.</p>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Modal>
                <AnimatePresence>
                    {isTaskModalOpen && selectedTaskId && (
                        <TaskDetailsModal
                            taskId={selectedTaskId}
                            onClose={handleCloseTaskModal}
                            onUpdate={handleTaskUpdate}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Dashboard;
