import React, { useEffect, useState } from 'react';
import api from '../api';

const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                // Assuming /users/activity/all is the endpoint for admin to get all activities
                // We might need to adjust based on api.php route structure
                // Logic in api.php: $action === 'activity' && $subAction === 'all' -> /users/activity/all
                const response = await api.get('/users/activity/all');
                setActivities(response.data);
            } catch (error) {
                console.error("Failed to fetch activities", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();

        // Optional: Poll for updates every 30 seconds
        const intervalId = setInterval(fetchActivities, 30000);
        return () => clearInterval(intervalId);
    }, []);

    if (loading) {
        return <div className="text-gray-500 text-sm">Loading activity...</div>;
    }

    if (activities.length === 0) {
        return <div className="text-gray-500 text-sm">No recent activity.</div>;
    }

    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {activities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                        <div className="relative pb-8">
                            {activityIdx !== activities.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                                        {/* Use user profile pic if available, else initials or generic icon */}
                                        {activity.profile_pic ? (
                                            <img className="h-8 w-8 rounded-full" src={activity.profile_pic} alt="" />
                                        ) : (
                                            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex flex-col sm:flex-row sm:justify-between sm:space-x-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            <span className="font-medium text-gray-900 mr-1">{activity.username || 'Unknown User'}</span>
                                            {activity.action}: <span className="font-medium text-gray-900 ml-1">{activity.task_title || 'Unknown Task'}</span>
                                        </p>
                                        {activity.details && (
                                            <p className="text-xs text-gray-400 mt-1">{activity.details}</p>
                                        )}
                                    </div>
                                    <div className="mt-1 sm:mt-0 text-left sm:text-right text-sm whitespace-nowrap text-gray-500">
                                        <time dateTime={activity.created_at}>{new Date(activity.created_at).toLocaleString()}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActivityFeed;
