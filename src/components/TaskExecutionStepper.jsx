import React, { useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ConfirmationModal from './ConfirmationModal';

const TaskExecutionStepper = ({ task, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const { notify } = useNotification();
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState('');

    // Override State
    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [overrideReason, setOverrideReason] = useState('');
    const [overrideStage, setOverrideStage] = useState('');

    // Regular Confirmation State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingStage, setPendingStage] = useState(null);

    const currentUser = user?.user;
    const isAssignee = currentUser && String(currentUser.id) === String(task.assigned_to);
    const isManager = currentUser && ['admin', 'manager', 'owner'].includes(currentUser.role);

    const steps = [
        { id: 'not_started', label: 'Assigned', icon: '📝' },
        { id: 'started', label: 'In Progress', icon: '🚀' },
        { id: 'local_done', label: 'Local Tested', icon: '🧪' },
        { id: 'live_done', label: 'Live Deployed', icon: '🌐' },
        { id: 'completed', label: 'Completed', icon: '✅' }
    ];

    // Helper to determine active step index
    const getCurrentStepIndex = () => {
        if (task.status === 'completed') return 4;
        if (task.status === 'waiting_for_review') return 3; // Technically live done
        const stage = task.execution_stage || 'not_started';
        return steps.findIndex(s => s.id === stage);
    };

    const currentStepIndex = getCurrentStepIndex();

    const executeUpdate = async (nextStage, reason = null) => {
        setLoading(true);
        try {
            await api.post(`/tasks/${task.id}/update-stage`, {
                stage: nextStage,
                note: reason || note
            });
            onUpdate(); // Refresh task data
            setNote('');
            setOverrideReason('');
            setShowOverrideModal(false);
            setPendingStage(null);
            notify.success(`Moved to ${nextStage} successfully!`);
        } catch (error) {
            notify.error(error.response?.data?.message || "Action failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (nextStage, reason = null) => {
        if (reason) {
            // Override with reason provided via modal
            await executeUpdate(nextStage, reason);
        } else {
            // Normal flow, require confirmation
            setPendingStage(nextStage);
            setShowConfirmModal(true);
        }
    };

    const confirmAction = () => {
        if (pendingStage) {
            executeUpdate(pendingStage);
            setShowConfirmModal(false);
        }
    };

    const openOverride = (stage) => {
        setOverrideStage(stage);
        setShowOverrideModal(true);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmAction}
                title="Confirm Action"
                message={`Are you sure you want to move this task to ${pendingStage}?`}
                confirmText="Yes, Proceed"
                isDangerous={false}
            />

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex justify-between items-center">
                Execution Workflow
                {!isAssignee && isManager && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-200">
                        Management View
                    </span>
                )}
            </h3>

            {/* Stepper UI */}
            <div className="relative flex items-center justify-between mb-8">
                {/* Connecting Line */}
                <div className="absolute top-[30%] left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-0"></div>
                <div
                    className="absolute top-[30%] left-0 h-1 bg-gradient-to-r from-[#00f6ff] to-[#a100ff] -z-0 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${isCompleted
                                    ? 'bg-gradient-to-r from-[#00f6ff] to-[#a100ff] text-white shadow-[0_0_15px_rgba(0,246,255,0.4)]'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                    }`}
                            >
                                {isCompleted ? (index < currentStepIndex ? '✓' : step.icon) : step.icon}
                            </div>
                            <span className={`mt-2 text-xs md:text-sm font-medium ${isCurrent ? 'text-[#00f6ff]' : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-black/20 p-4 rounded-xl">
                <div>
                    <strong>Started:</strong> <br /> {task.started_at ? new Date(task.started_at).toLocaleString() : '-'}
                </div>
                <div>
                    <strong>Local Run:</strong> <br /> {task.local_run_at ? new Date(task.local_run_at).toLocaleString() : '-'}
                </div>
                <div>
                    <strong>Live Run:</strong> <br /> {task.live_run_at ? new Date(task.live_run_at).toLocaleString() : '-'}
                </div>
                <div>
                    <strong>Completed:</strong> <br /> {task.completed_at ? new Date(task.completed_at).toLocaleString() : '-'}
                </div>
            </div>

            {/* Actions Area */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Note Input - Only for Assignee in normal flow */}
                {isAssignee && currentStepIndex < 4 && (
                    <div className="w-full md:w-auto flex-1">
                        <textarea
                            placeholder="Add execution note (optional)..."
                            className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-[#00f6ff] outline-none transition-all"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                )}

                {/* VISIBLE ONLY TO ASSIGNEE */}
                {isAssignee && (
                    <div className="flex gap-4">
                        {task.execution_stage === 'not_started' && (
                            <button
                                onClick={() => handleAction('started')}
                                disabled={loading}
                                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg hover:shadow-blue-500/30"
                            >
                                {loading ? 'Starting...' : 'Start Task'}
                            </button>
                        )}

                        {task.execution_stage === 'started' && (
                            <button
                                onClick={() => handleAction('local_done')}
                                disabled={loading}
                                className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg hover:shadow-purple-500/30"
                            >
                                {loading ? 'Processing...' : 'Mark Local Tested'}
                            </button>
                        )}

                        {task.execution_stage === 'local_done' && (
                            <button
                                onClick={() => handleAction('live_done')}
                                disabled={loading}
                                className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg hover:shadow-red-500/30 animate-pulse-slow"
                            >
                                {loading ? 'Deploying...' : 'Confirm Live Deployment'}
                            </button>
                        )}

                        {task.execution_stage === 'live_done' && task.status !== 'waiting_for_review' && task.status !== 'completed' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAction('review')}
                                    disabled={loading}
                                    className="px-6 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-bold transition-all shadow-lg hover:shadow-yellow-500/30"
                                >
                                    Submit for Review
                                </button>
                                <button
                                    onClick={() => handleAction('completed')}
                                    disabled={loading}
                                    className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-all shadow-lg hover:shadow-green-500/30"
                                >
                                    Mark Completed
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* MANAGEMENT OVERRIDE CONTROLS */}
                {isManager && !isAssignee && (
                    <div className="flex flex-col items-end w-full">
                        <div className="text-sm text-gray-400 mb-2 italic">
                            Strict execution mode. Only the assignee can perform routine actions.
                            <br /> Use override to force state changes.
                        </div>
                        <div className="flex gap-2">
                            {/* Allow reset */}
                            {task.execution_stage !== 'not_started' && (
                                <button
                                    onClick={() => openOverride('not_started')}
                                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white text-sm"
                                >
                                    Reset to Start
                                </button>
                            )}
                            {/* Allow forcing completion */}
                            {task.status !== 'completed' && (
                                <button
                                    onClick={() => openOverride('completed')}
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm uppercase font-bold"
                                >
                                    Force Complete
                                </button>
                            )}
                            {/* Generic Next Step Override based on current state */}
                            {task.execution_stage === 'not_started' && (
                                <button onClick={() => openOverride('started')} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm">Force Start</button>
                            )}
                            {task.execution_stage === 'started' && (
                                <button onClick={() => openOverride('local_done')} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm">Force Local Done</button>
                            )}
                            {task.execution_stage === 'local_done' && (
                                <button onClick={() => openOverride('live_done')} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm">Force Live Done</button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* OVERRIDE REASON DISPLAY FOR ASSIGNEE */}
            {isAssignee && task.last_override_reason && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Management Override/Update
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                <p>
                                    Last update was made by a manager. Reason provided:
                                </p>
                                <p className="mt-1 font-semibold italic">
                                    "{task.last_override_reason}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OVERRIDE MODAL */}
            {showOverrideModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Confirm Override
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                            You are about to force the task stage to <span className="font-bold text-white bg-gray-700 px-2 py-0.5 rounded">{overrideStage}</span>.
                            This action will be logged. A valid reason is required.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Reason for Override <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                rows={3}
                                placeholder="E.g., Developer is unavailable, urgent fix required..."
                                value={overrideReason}
                                onChange={(e) => setOverrideReason(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowOverrideModal(false)}
                                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(overrideStage, overrideReason)}
                                disabled={!overrideReason.trim() || loading}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Processing...' : 'Confirm Override'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskExecutionStepper;
