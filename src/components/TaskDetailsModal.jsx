import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api, { MEDIA_URL } from '../api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const TaskDetailsModal = ({ taskId, onClose, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [answers, setAnswers] = useState({});
    const [draftAnswers, setDraftAnswers] = useState({});
    const [loading, setLoading] = useState(true);

    const currentUser = user?.user;

    useEffect(() => {
        const fetchTaskData = async () => {
            setLoading(true);
            try {
                const taskRes = await api.get(`/tasks/${taskId}`);
                setTask(taskRes.data);

                const commentsRes = await api.get(`/tasks/${taskId}/comments`);
                setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);

                const attachmentsRes = await api.get(`/tasks/${taskId}/attachments`);
                setAttachments(Array.isArray(attachmentsRes.data) ? attachmentsRes.data : []);

                // Fetch existing answers
                const answersRes = await api.get(`/task-answers/task/${taskId}`);
                const answersMap = {};

                if (Array.isArray(answersRes.data)) {
                    // Filter answers based on role
                    const relevantAnswers = answersRes.data.filter(a => {
                        const answerUserId = String(a.user_id);
                        const currentUserId = String(currentUser?.id);
                        const assignedUserId = String(taskRes.data.assigned_to);

                        if (currentUser?.role === 'admin') {
                            return answerUserId === assignedUserId;
                        } else {
                            return answerUserId === currentUserId;
                        }
                    });

                    relevantAnswers.forEach(a => {
                        if (!answersMap[a.question_id]) {
                            answersMap[a.question_id] = a.answer_value;
                        }
                    });
                }
                setAnswers(answersMap);
            } catch (error) {
                console.error("Error fetching task data", error);
            } finally {
                setLoading(false);
            }
        };
        if (taskId && user) {
            fetchTaskData();
        }
    }, [taskId, user]);

    const handleAddComment = async (e, contextId = null) => {
        e && e.preventDefault();
        const content = contextId ? newComment[contextId] : newComment;
        if (!content || !content.trim()) return;

        try {
            await api.post(`/tasks/${taskId}/comments`, { content: content, context_id: contextId });
            const commentsRes = await api.get(`/tasks/${taskId}/comments`);
            setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
            if (contextId) {
                setNewComment({ ...newComment, [contextId]: '' });
            } else {
                setNewComment('');
            }
        } catch (error) {
            alert("Failed to add comment");
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            setTask({ ...task, status: newStatus });
            if (onUpdate) onUpdate(); // Refresh kanban
        } catch (error) {
            alert("Failed to update status");
        }
    };

    // ... Answer handling logic similar to TaskDetails ...
    const handleAnswerChange = async (questionId, value, type) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        try {
            await api.post('/task-answers', {
                task_id: taskId,
                question_id: questionId,
                answer_type: type,
                answer_value: value
            });
        } catch (error) { console.error(error); }
    };

    const handleDraftChange = (questionId, value) => {
        setDraftAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const saveAnswer = async (questionId, type) => {
        const value = draftAnswers[questionId];
        if (value === undefined || value === null || value === '') return;
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        try {
            await api.post('/task-answers', {
                task_id: taskId,
                question_id: questionId,
                answer_type: type,
                answer_value: value
            });
            setDraftAnswers(prev => {
                const newDrafts = { ...prev };
                delete newDrafts[questionId];
                return newDrafts;
            });
        } catch (error) {
            alert("Failed to save answer.");
        }
    };

    const renderQuestionInput = (q, answers, onChange) => {
        const committedValue = answers[q.id];
        const isLocked = committedValue !== undefined && committedValue !== null && committedValue !== '';
        const value = isLocked ? committedValue : (draftAnswers[q.id] !== undefined ? draftAnswers[q.id] : '');

        if (isLocked) {
            const displayValue = q.type === 'checkbox' && Array.isArray(committedValue) ? committedValue.join(', ')
                : (typeof committedValue === 'string' && committedValue.startsWith('[') ? JSON.parse(committedValue).join(', ') : committedValue);

            return (
                <div className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 text-sm">
                    <span className="font-medium">Answer:</span> {displayValue}
                    <span className="ml-2 text-xs text-gray-500">(Locked)</span>
                </div>
            );
        }

        // Simplified inputs for modal
        switch (q.type) {
            case 'boolean':
                return (
                    <div className="flex items-center gap-4">
                        <label className="inline-flex items-center cursor-pointer">
                            <input type="radio" className="form-radio text-primary-600" name={`q-${q.id}`} value="yes" checked={value === 'yes'} onChange={() => handleAnswerChange(q.id, 'yes', q.type)} />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Yes</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                            <input type="radio" className="form-radio text-primary-600" name={`q-${q.id}`} value="no" checked={value === 'no'} onChange={() => handleAnswerChange(q.id, 'no', q.type)} />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">No</span>
                        </label>
                    </div>
                );
            case 'select':
                return (
                    <select value={value} onChange={(e) => handleAnswerChange(q.id, e.target.value, q.type)} className="block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="">Select</option>
                        {q.options && q.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                );
            default:
                return (
                    <div className="flex gap-2">
                        <input type={q.type === 'number' ? 'number' : 'text'} placeholder="Answer..." value={value} onChange={(e) => handleDraftChange(q.id, e.target.value)} className="flex-1 shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        <button onClick={() => saveAnswer(q.id, q.type)} disabled={!value} className="px-3 py-1 bg-primary-600 text-white rounded text-xs disabled:opacity-50">Save</button>
                    </div>
                );
        }
    };


    if (!taskId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-start bg-gray-50 dark:bg-[#1a1f2e]">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</h2>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {task.priority}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Assigned to: {task.assigned_user_name || 'Unassigned'}
                                    </span>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                            {/* Description */}
                            <div className="prose dark:prose-invert max-w-none">
                                <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{task.description || "No description provided."}</p>
                            </div>

                            {/* Status */}
                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Status</h3>
                                <select
                                    value={task.status}
                                    onChange={handleStatusChange}
                                    className="block w-full sm:w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {/* Structured Questions */}
                            {task.questions && JSON.parse(task.questions).length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-4">Questions</h3>
                                    <div className="space-y-6">
                                        {JSON.parse(task.questions).map((q, index) => (
                                            <div key={q.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="mb-2">
                                                    <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">
                                                        {index + 1}. {q.text} {q.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    {/* Answer Input */}
                                                    {renderQuestionInput(q, answers)}
                                                </div>
                                                {/* Comments for Question */}
                                                <div className="mt-3 ml-2 pl-3 border-l-2 border-gray-200 dark:border-gray-600">
                                                    <div className="space-y-2 mb-2">
                                                        {comments.filter(c => c.context_id === `q-${q.id}`).map(c => (
                                                            <div key={c.id} className="text-xs text-gray-600 dark:text-gray-400">
                                                                <span className="font-bold">{c.username}:</span> {c.content}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            className="flex-1 text-xs border-gray-300 dark:border-gray-600 rounded p-1.5 dark:bg-gray-700 dark:text-white"
                                                            placeholder="Comment..."
                                                            value={newComment[`q-${q.id}`] || ''}
                                                            onChange={(e) => setNewComment({ ...newComment, [`q-${q.id}`]: e.target.value })}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(e, `q-${q.id}`) }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* General Comments */}
                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-4">Comments</h3>
                                <div className="space-y-4 mb-4">
                                    {comments.filter(c => !c.context_id).map(comment => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {comment.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
                                                <div className="flex justify-between mb-1">
                                                    <span className="font-bold text-gray-900 dark:text-white">{comment.username}</span>
                                                    <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Add a comment..."
                                        value={typeof newComment === 'string' ? newComment : ''}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(e) }}
                                    />
                                    <button onClick={(e) => handleAddComment(e)} className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700">Post</button>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between">
                                <div>{/* Attachments could go here summary */}</div>
                                <Link to={`/tasks/${task.id}`} className="text-sm text-primary-600 hover:text-primary-500">
                                    View Full Page &rarr;
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default TaskDetailsModal;
