import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';
import Calendar from '../components/Calendar';
import Modal from '../components/Modal';
import ActivityFeed from '../components/ActivityFeed';

const Dashboard = ({ showTitle = true }) => {
    const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
    const [recentTasks, setRecentTasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDateTasks, setSelectedDateTasks] = useState([]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Trigger Recurring Task Generation (Lazy Automation)
                if (user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner')) {
                    api.post('/recurring-tasks/generate').catch(err => console.error("Auto-generation failed", err));
                }

                // Fetch Stats from Backend
                const statsResponse = await api.get('/tasks/stats');
                setStats(statsResponse.data);

                // Fetch Recent Tasks (Limit 5)
                const tasksResponse = await api.get('/tasks?limit=5');
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

    const StatCard = ({ title, value, colorClass, icon }) => (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={`rounded-md p-3 ${colorClass}`}>
                            {icon}
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
                            <dd className="text-3xl font-semibold text-gray-900 dark:text-white">{value}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0 flex items-center">
                        {showTitle && (
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                                Dashboard
                            </h2>
                        )}
                        <button
                            onClick={() => setIsCalendarOpen(true)}
                            className="ml-4 p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                            title="Open Calendar"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        {user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner') && (
                            <Link to="/create-task" className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 no-underline">
                                Create New Task
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <StatCard
                        title="Total Tasks"
                        value={stats.total}
                        colorClass="bg-indigo-500 text-white"
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pending}
                        colorClass="bg-yellow-500 text-white"
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                        title="In Progress"
                        value={stats.in_progress}
                        colorClass="bg-blue-500 text-white"
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    />
                    <StatCard
                        title="Completed"
                        value={stats.completed}
                        colorClass="bg-green-500 text-white"
                        icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                </div>

                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Recent Tasks</h3>
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200 mb-8">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentTasks.map(task => (
                            <li key={task.id}>
                                <Link to={`/tasks/${task.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700 no-underline transition-colors duration-150">
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
                                </Link>
                            </li>
                        ))}
                        {recentTasks.length === 0 && (
                            <li className="px-4 py-4 sm:px-6 text-gray-500 dark:text-gray-400 text-center">No recent tasks found.</li>
                        )}
                    </ul>
                </div>

                {user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner') && (
                    <div className="mt-8">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">User Activity Feed</h3>
                        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6 max-h-96 overflow-y-auto">
                            <ActivityFeed />
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
                                            <Link
                                                to={`/tasks/${task.id}`}
                                                className="block hover:bg-gray-50 dark:hover:bg-gray-700 no-underline transition-colors duration-150"
                                                onClick={() => setIsCalendarOpen(false)}
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
                                            </Link>
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
            </div>
        </div>
    );
};

export default Dashboard;
