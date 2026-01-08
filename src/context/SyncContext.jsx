import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from './AuthContext';

export const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [taskUpdateTrigger, setTaskUpdateTrigger] = useState(0);
    const [notificationUpdateTrigger, setNotificationUpdateTrigger] = useState(0);

    // Internal state to track last known server state
    const [lastTaskSync, setLastTaskSync] = useState(0);
    const [lastTaskCount, setLastTaskCount] = useState(0);
    const [lastNotificationSync, setLastNotificationSync] = useState(0);
    const [lastNotificationCount, setLastNotificationCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        let isMounted = true;
        let timeoutId;

        const pollSyncStatus = async () => {
            try {
                const response = await api.get('/sync');
                if (!isMounted) return;

                const data = response.data;

                // Check Tasks
                // Trigger if timestamp changed OR count changed
                setLastTaskSync(prevTs => {
                    // Using functional updates to access latest state without adding to dependency array
                    // Use refs if complex state access is needed, but this is cleaner for simple comparisons
                    // actually, we need the latest 'lastTaskSync' to compare.
                    // The previous implementation used closure state which could be stale if not updating dependencies.
                    // But updating dependencies resets the interval.

                    // Let's rely on standard state updates.
                    return prevTs;
                });

                // Let's simplify: compare with data and current state from render scope? 
                // No, render scope values are captured at effect creation.
                // We need to use functional state updates or refs for mutable current values.

                // Better approach with refs for "last known" values to avoid effect re-running
            } catch (error) {
                console.error("Sync polling failed", error);
            } finally {
                if (isMounted) {
                    timeoutId = setTimeout(pollSyncStatus, 5000);
                }
            }
        };

        // Instead of complex refactoring inside the effect, let's just use refs for the values
        // so we don't have to restart the poll loop every time state changes.
        // But wait, we need to trigger state updates which cause re-renders. 

        // Let's implement the loop simply first.
        pollSyncStatus();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [user]); // Only restart if user changes. 

    // We need refs to store the "last known" values so we can compare inside the closure
    // without adding them to dependencies (which would restart the loop on every update)
    const lastStateRef = React.useRef({
        taskTs: 0,
        taskCount: 0,
        notifTs: 0,
        notifCount: 0
    });

    useEffect(() => {
        if (!user) return;
        let isMounted = true;
        let timeoutId;

        const pollSyncStatus = async () => {
            try {
                const response = await api.get('/sync');
                if (!isMounted) return;

                const data = response.data;
                const prev = lastStateRef.current;

                // Check Tasks
                if (data.tasks && (data.tasks.last_updated !== prev.taskTs || data.tasks.total_count !== prev.taskCount)) {
                    if (prev.taskTs !== 0 || prev.taskCount !== 0) {
                        console.log("SyncContext: New task data detected. Triggering refresh.");
                        setTaskUpdateTrigger(c => c + 1);
                    }
                    // Update ref immediately
                    lastStateRef.current.taskTs = data.tasks.last_updated;
                    lastStateRef.current.taskCount = data.tasks.total_count;
                    // Update state to keep visible if needed (but we use ref for logic)
                    setLastTaskSync(data.tasks.last_updated);
                    setLastTaskCount(data.tasks.total_count);
                } else if (!data.tasks) {
                    console.warn("SyncContext: Missing 'tasks' data in response", data);
                }

                // Check Notifications
                if (data.notifications && (data.notifications.last_created !== prev.notifTs || data.notifications.unread_count !== prev.notifCount)) {
                    if (prev.notifTs !== 0 || prev.notifCount !== 0) {
                        console.log("SyncContext: New notification detected. Triggering refresh.");
                        setNotificationUpdateTrigger(c => c + 1);
                    }
                    lastStateRef.current.notifTs = data.notifications.last_created;
                    lastStateRef.current.notifCount = data.notifications.unread_count;
                    setLastNotificationSync(data.notifications.last_created);
                    setLastNotificationCount(data.notifications.unread_count);
                } else if (!data.notifications) {
                    console.warn("SyncContext: Missing 'notifications' data in response", data);
                }

            } catch (error) {
                console.error("Sync polling failed", error);
            } finally {
                if (isMounted) {
                    timeoutId = setTimeout(pollSyncStatus, 5000); // Wait 5s AFTER completion
                }
            }
        };

        pollSyncStatus();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [user]);

    return (
        <SyncContext.Provider value={{ taskUpdateTrigger, notificationUpdateTrigger }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error('useSync must be used within a SyncProvider');
    }
    return context;
};
