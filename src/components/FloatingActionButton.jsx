import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const FloatingActionButton = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // Only show for admin, manager, owner
    if (!user || (user.user.role !== 'admin' && user.user.role !== 'manager' && user.user.role !== 'owner')) {
        return null;
    }

    return (
        <button
            onClick={() => navigate('/create-task')}
            className="md:hidden fixed bottom-6 right-6 p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg z-50 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            aria-label="Create Task"
            title="Create Task"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
    );
};

export default FloatingActionButton;
