import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { MEDIA_URL } from '../api';
import { AuthContext } from '../context/AuthContext';

const TaskDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useContext(AuthContext);
    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [attachments, setAttachments] = useState([]);
    const [answers, setAnswers] = useState({}); // Store answers by question ID

    const currentUser = user?.user;

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                const taskRes = await api.get(`/tasks/${id}`);
                setTask(taskRes.data);

                const commentsRes = await api.get(`/tasks/${id}/comments`);
                setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);

                const attachmentsRes = await api.get(`/tasks/${id}/attachments`);
                setAttachments(Array.isArray(attachmentsRes.data) ? attachmentsRes.data : []);

                // Fetch existing answers
                const answersRes = await api.get(`/task-answers/task/${id}`);
                const answersMap = {};

                if (Array.isArray(answersRes.data)) {
                    // Filter answers based on role
                    const relevantAnswers = answersRes.data.filter(a => {
                        // Robust comparison for IDs
                        const answerUserId = String(a.user_id);
                        const currentUserId = String(currentUser?.id);
                        const assignedUserId = String(taskRes.data.assigned_to);

                        if (currentUser?.role === 'admin') {
                            // For admin, show answer from assigned user
                            return answerUserId === assignedUserId;
                        } else {
                            // For regular user, show their own answer
                            return answerUserId === currentUserId;
                        }
                    });

                    relevantAnswers.forEach(a => {
                        // Only set if not already set (prioritize newest because API returns DESC)
                        if (!answersMap[a.question_id]) {
                            answersMap[a.question_id] = a.answer_value;
                        }
                    });
                }
                setAnswers(answersMap);
            } catch (error) {
                console.error("Error fetching task data", error);
                setComments([]);
                setAttachments([]);
            }
        };
        if (user) {
            fetchTaskData();
        }
    }, [id, user]);

    const handleAddComment = async (e, contextId = null) => {
        e && e.preventDefault();
        const content = contextId ? newComment[contextId] : newComment;
        if (!content || !content.trim()) return;

        try {
            await api.post(`/tasks/${id}/comments`, { content: content, context_id: contextId });
            // Refresh comments
            const commentsRes = await api.get(`/tasks/${id}/comments`);
            setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
            if (contextId) {
                setNewComment({ ...newComment, [contextId]: '' });
            } else {
                setNewComment('');
            }
        } catch (error) {
            console.error("Error adding comment", error);
            alert("Failed to add comment");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`/tasks/${id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Refresh attachments
            const attachmentsRes = await api.get(`/tasks/${id}/attachments`);
            setAttachments(attachmentsRes.data);
        } catch (error) {
            console.error("Error uploading file", error);
            alert("Failed to upload file");
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            await api.put(`/tasks/${id}`, { status: newStatus });
            setTask({ ...task, status: newStatus });
        } catch (error) {
            console.error("Error updating status", error);
            alert("Failed to update status");
        }
    };

    const handleAnswerChange = async (questionId, value, type) => {
        // Optimistic update
        setAnswers(prev => ({ ...prev, [questionId]: value }));

        try {
            await api.post('/task-answers', {
                task_id: id,
                question_id: questionId,
                answer_type: type,
                answer_value: value
            });
        } catch (error) {
            console.error("Error saving answer", error);
            // Revert on error (optional, but good practice)
        }
    };

    const [draftAnswers, setDraftAnswers] = useState({}); // Store unsaved answers

    const handleDraftChange = (questionId, value) => {
        setDraftAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const saveAnswer = async (questionId, type) => {
        const value = draftAnswers[questionId];
        if (value === undefined || value === null || value === '') return;

        // Optimistic update
        setAnswers(prev => ({ ...prev, [questionId]: value }));

        try {
            await api.post('/task-answers', {
                task_id: id,
                question_id: questionId,
                answer_type: type,
                answer_value: value
            });
            // Clear draft after successful save
            setDraftAnswers(prev => {
                const newDrafts = { ...prev };
                delete newDrafts[questionId];
                return newDrafts;
            });
        } catch (error) {
            console.error("Error saving answer", error);
            alert("Failed to save answer. Please try again.");
            // Revert optimistic update if needed, but for now we just alert
        }
    };

    const renderQuestionInput = (q, answers, onChange) => {
        // Check if we have a committed answer
        const committedValue = answers[q.id];
        const isLocked = committedValue !== undefined && committedValue !== null && committedValue !== '';

        // For draft value, use draftAnswers if available, otherwise default to empty string
        // If locked, show committed value
        const value = isLocked ? committedValue : (draftAnswers[q.id] !== undefined ? draftAnswers[q.id] : '');

        if (isLocked) {
            // Render locked view for all types
            if (q.type === 'boolean') {
                return (
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Answer:</span> <span className="capitalize">{committedValue}</span>
                        <span className="ml-2 text-xs text-gray-500">(Locked)</span>
                    </div>
                );
            } else if (q.type === 'checkbox') {
                const val = Array.isArray(committedValue) ? committedValue : JSON.parse(committedValue || '[]');
                return (
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Answer:</span> {val.join(', ')}
                        <span className="ml-2 text-xs text-gray-500">(Locked)</span>
                    </div>
                );
            } else {
                return (
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Answer:</span> {committedValue}
                        <span className="ml-2 text-xs text-gray-500">(Locked)</span>
                    </div>
                );
            }
        }

        // Render editable inputs
        switch (q.type) {
            case 'long_text':
                return (
                    <div className="space-y-2">
                        <textarea
                            rows={3}
                            placeholder="Enter your answer..."
                            value={value}
                            onChange={(e) => handleDraftChange(q.id, e.target.value)}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                            onClick={() => saveAnswer(q.id, q.type)}
                            disabled={!value}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${!value ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Save Answer
                        </button>
                    </div>
                );
            case 'boolean':
                return (
                    <div className="flex items-center gap-4">
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="radio"
                                className="form-radio text-primary-600"
                                name={`q-${q.id}`}
                                value="yes"
                                checked={value === 'yes'}
                                onChange={() => handleAnswerChange(q.id, 'yes', q.type)} // Immediate save for boolean
                            />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Yes</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="radio"
                                className="form-radio text-primary-600"
                                name={`q-${q.id}`}
                                value="no"
                                checked={value === 'no'}
                                onChange={() => handleAnswerChange(q.id, 'no', q.type)} // Immediate save for boolean
                            />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">No</span>
                        </label>
                    </div>
                );
            case 'number':
                return (
                    <div className="space-y-2">
                        <input
                            type="number"
                            placeholder="Enter a number..."
                            value={value}
                            onChange={(e) => handleDraftChange(q.id, e.target.value)}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                            onClick={() => saveAnswer(q.id, q.type)}
                            disabled={!value}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${!value ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Save Answer
                        </button>
                    </div>
                );
            case 'date':
                return (
                    <div className="space-y-2">
                        <input
                            type="date"
                            value={value}
                            onChange={(e) => handleDraftChange(q.id, e.target.value)}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                            onClick={() => saveAnswer(q.id, q.type)}
                            disabled={!value}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${!value ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Save Answer
                        </button>
                    </div>
                );
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value, q.type)} // Immediate save for select
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="">Select an option</option>
                        {q.options && q.options.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'checkbox':
                // Checkbox logic is a bit complex for immediate save vs draft. 
                // Let's make it draft-based with a save button for consistency with multi-select nature.
                const selected = Array.isArray(value) ? value : (value ? JSON.parse(value) : []);
                const handleCheck = (opt) => {
                    const newSelected = selected.includes(opt)
                        ? selected.filter(s => s !== opt)
                        : [...selected, opt];
                    handleDraftChange(q.id, JSON.stringify(newSelected));
                };
                return (
                    <div className="space-y-2">
                        <div className="space-y-2">
                            {q.options && q.options.map((opt, i) => (
                                <div key={i} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        checked={selected.includes(opt)}
                                        onChange={() => handleCheck(opt)}
                                    />
                                    <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                        {opt}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => saveAnswer(q.id, q.type)}
                            disabled={selected.length === 0}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Save Answer
                        </button>
                    </div>
                );
            case 'file':
                return (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            disabled
                            className="bg-gray-100 dark:bg-gray-600 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border text-gray-500"
                            value="File upload for questions coming soon..."
                        />
                    </div>
                );
            case 'text':
            default:
                return (
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Enter your answer..."
                            value={value}
                            onChange={(e) => handleDraftChange(q.id, e.target.value)}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                            onClick={() => saveAnswer(q.id, q.type)}
                            disabled={!value}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${!value ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Save Answer
                        </button>
                    </div>
                );
        }
    };



    if (!task) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (

        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <button
                onClick={() => navigate('/tasks')}
                className="mb-4 text-primary-600 hover:text-primary-500 font-medium flex items-center"
            >
                &larr; Back to Tasks
            </button>

            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <nav className="flex mb-2" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2">
                            <li><Link to="/tasks" className="text-gray-400 hover:text-white transition-colors">Tasks</Link></li>
                            <li><span className="text-gray-600">/</span></li>
                            <li className="text-white font-medium truncate max-w-[200px]">{task.title}</li>
                        </ol>
                    </nav>
                    <h1 className="text-3xl font-bold text-white break-words">{task.title}</h1>
                </div>

                <div className="flex items-center gap-3 bg-[#1a1f2e] p-2 rounded-xl border border-white/10">
                    {user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner') && (
                        <>
                            <Link
                                to={`/edit-task/${task.id}`}
                                className="px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center border border-blue-500/20 no-underline"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </Link>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-medium transition-colors flex items-center border border-red-500/20"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8 transition-colors duration-200">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            {task.title}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                            Task details and information.
                        </p>
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="status" className="sr-only">Status</label>
                        {task.status === 'completed' ? (
                            <span className="px-4 py-2 rounded-md text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border border-green-200 dark:border-green-800 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Completed
                            </span>
                        ) : (
                            <select
                                id="status"
                                name="status"
                                className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white
                                    ${task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'}`}
                                value={task.status}
                                onChange={handleStatusChange}
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        )}
                        {task.is_extended == 1 && (
                            <span className="ml-3 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                                Extended
                            </span>
                        )}
                    </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                                {task.description || <span className="italic text-gray-400">No description provided</span>}
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</dt>
                            <dd className={`mt-1 text-sm sm:mt-0 sm:col-span-2 capitalize font-semibold ${task.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                                task.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-green-600 dark:text-green-400'
                                }`}>
                                {task.priority}
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium">{task.due_date || 'None'}</span>
                                </div>

                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                                {task.assigned_user_name || 'Unassigned'}
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                                {task.creator_name || 'Unknown'}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Structured Questions Section */}
            {task.questions && JSON.parse(task.questions).length > 0 && (
                <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg mb-8 transition-colors duration-200">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Structured Questions</h3>
                        <div className="space-y-8">
                            {JSON.parse(task.questions).map((q, index) => (
                                <div key={q.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                                    <div className="flex flex-col gap-2 mb-2">
                                        <div className="flex items-start justify-between">
                                            <label className="text-md font-semibold text-gray-900 dark:text-white">
                                                {index + 1}. {q.text} {q.required && <span className="text-red-500">*</span>}
                                            </label>
                                            {/* Status indicator if answered */}
                                            {answers[q.id] && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    Answered
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-1">
                                            {/* Only the assigned user can answer. Everyone else (Admin, Manager, Unassigned, etc.) sees read-only. */}
                                            {String(currentUser?.id) !== String(task.assigned_to) ? (
                                                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                                                    {answers[q.id] ? (
                                                        q.type === 'boolean' ? (
                                                            <span className="capitalize">{answers[q.id]}</span>
                                                        ) : q.type === 'checkbox' ? (
                                                            <span>
                                                                {Array.isArray(answers[q.id])
                                                                    ? answers[q.id].join(', ')
                                                                    : (typeof answers[q.id] === 'string' && answers[q.id].startsWith('[')
                                                                        ? JSON.parse(answers[q.id]).join(', ')
                                                                        : answers[q.id])}
                                                            </span>
                                                        ) : (
                                                            <span>{answers[q.id]}</span>
                                                        )
                                                    ) : (
                                                        <span className="text-gray-500 italic">No answer provided</span>
                                                    )}
                                                </div>
                                            ) : (
                                                renderQuestionInput(q, answers, handleAnswerChange)
                                            )}
                                        </div>
                                    </div>

                                    {/* Comments for main question */}
                                    <div className="ml-4 mb-4 border-l-2 border-gray-100 dark:border-gray-700 pl-4">
                                        <div className="space-y-2 mb-2">
                                            {comments.filter(c => c.context_id === `q-${q.id}`).map(c => (
                                                <div key={c.id} className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm">
                                                    <span className="font-bold text-gray-900 dark:text-white mr-2">{c.username}:</span>
                                                    <span className="text-gray-700 dark:text-gray-300">{c.content}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="Add a comment..."
                                                value={newComment[`q-${q.id}`] || ''}
                                                onChange={(e) => setNewComment({ ...newComment, [`q-${q.id}`]: e.target.value })}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddComment(null, `q-${q.id}`);
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => handleAddComment(null, `q-${q.id}`)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                Reply
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sub-questions */}
                                    {q.subQuestions && q.subQuestions.length > 0 && (
                                        <div className="ml-8 space-y-6 mt-4">
                                            {q.subQuestions.map((sub, subIndex) => (
                                                <div key={sub.id}>
                                                    <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                                                        {index + 1}.{subIndex + 1}. {sub.text}
                                                    </h5>
                                                    {/* Comments for sub-question */}
                                                    <div className="ml-4 border-l-2 border-gray-100 dark:border-gray-700 pl-4">
                                                        <div className="space-y-2 mb-2">
                                                            {comments.filter(c => c.context_id === `q-${q.id}-sub-${sub.id}`).map(c => (
                                                                <div key={c.id} className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs">
                                                                    <span className="font-bold text-gray-900 dark:text-white mr-2">{c.username}:</span>
                                                                    <span className="text-gray-700 dark:text-gray-300">{c.content}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full text-xs border-gray-300 dark:border-gray-600 rounded-md p-1.5 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                placeholder="Add a comment..."
                                                                value={newComment[`q-${q.id}-sub-${sub.id}`] || ''}
                                                                onChange={(e) => setNewComment({ ...newComment, [`q-${q.id}-sub-${sub.id}`]: e.target.value })}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        handleAddComment(null, `q-${q.id}-sub-${sub.id}`);
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => handleAddComment(null, `q-${q.id}-sub-${sub.id}`)}
                                                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                            >
                                                                Reply
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Comments Section */}
                <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg transition-colors duration-200">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">General Comments</h3>
                        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                            {comments.filter(c => !c.context_id).length === 0 && <p className="text-gray-500 text-sm italic">No comments yet.</p>}
                            {comments.filter(c => !c.context_id).map(comment => (
                                <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            {comment.profile_pic ? (
                                                <img src={comment.profile_pic.startsWith('http') ? comment.profile_pic : `${MEDIA_URL}${comment.profile_pic}`} alt={comment.username} className="w-6 h-6 rounded-full" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {comment.username.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{comment.username}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 pl-8">{comment.content}</p>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleAddComment}>
                            <div className="mt-1">
                                <textarea
                                    rows={3}
                                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    placeholder="Add a comment..."
                                    value={typeof newComment === 'string' ? newComment : ''}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                            </div>
                            <div className="mt-3 text-right">
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Post Comment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Files Section */}
                <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg transition-colors duration-200">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Attachments</h3>

                        {/* File List */}
                        <div className="space-y-3 mb-6">
                            {attachments.length === 0 && <p className="text-gray-500 text-sm italic">No attachments yet.</p>}
                            {attachments.map(file => (
                                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{file.file_name}</p>
                                            <p className="text-xs text-gray-500">by {file.username}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`${MEDIA_URL}${file.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                                    >
                                        Download
                                    </a>
                                </div>
                            ))}
                        </div>

                        <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer block">
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6" />
                            </svg>
                            <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                                Upload a file
                            </span>
                            <p className="mt-1 text-xs text-gray-500">
                                PNG, JPG, PDF up to 10MB
                            </p>
                        </label>
                    </div>
                </div>
            </div>


            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowSuccessModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full">
                            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                            Success
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Deadline extended successfully!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="button" onClick={() => setShowSuccessModal(false)} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm">
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Debug Section */}
        </div>
    );
};

export default TaskDetails;
