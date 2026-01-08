import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const EditTask = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { notify } = useNotification();
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assigned_to: '',
        project_id: '',
        // Recurring fields - usually difficult to edit mid-stream without complex logic, 
        // but we'll include them as read/write for now or readonly if needed.
        is_recurring: false,
        frequency: 'daily',
        start_date: '',
        recurrence_trigger: 'schedule',
        questions: [],
        requires_execution_workflow: false // Default to false
    });
    const [projects, setProjects] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if ((user?.user?.role === 'admin' || user?.user?.role === 'manager' || user?.user?.role === 'owner') && !formData.assigned_to) {
            newErrors.assigned_to = 'Assign To is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (user && (user.user.role === 'admin' || user.user.role === 'manager' || user.user.role === 'owner')) {
            fetchUsers();
            fetchProjects();
            fetchTaskDetails();
        } else {
            // Redirect if not authorized (though route should handle this)
            navigate('/dashboard');
        }
    }, [user, id]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error("Error fetching projects", error);
        }
    };

    const fetchTaskDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/tasks/${id}`);
            const task = response.data;

            // Populate form
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'medium',
                due_date: task.due_date || '',
                assigned_to: task.assigned_to || '',
                project_id: task.project_id || '',
                is_recurring: task.is_recurring == 1,
                frequency: task.frequency || 'daily',
                start_date: task.start_date || '',
                recurrence_trigger: task.recurrence_trigger || 'schedule',
                questions: task.questions ? (typeof task.questions === 'string' ? JSON.parse(task.questions) : task.questions) : [],
                requires_execution_workflow: task.requires_execution_workflow == 1
            });
        } catch (error) {
            console.error("Error fetching task details", error);
            notify.error("Failed to load task details");
            navigate('/tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    // Questions Builder Logic (Simplified for Edit - mostly just updating text/options)
    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [...formData.questions, {
                id: Date.now(),
                text: '',
                type: 'text',
                options: [],
                required: false,
                subQuestions: []
            }]
        });
    };

    const updateQuestion = (id, field, value) => {
        const updatedQuestions = formData.questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        );
        setFormData({ ...formData, questions: updatedQuestions });
    };

    const removeQuestion = (id) => {
        setFormData({
            ...formData,
            questions: formData.questions.filter(q => q.id !== id)
        });
    };

    // Sub-questions logic
    const addSubQuestion = (qId) => {
        const updatedQuestions = formData.questions.map(q => {
            if (q.id === qId) {
                return {
                    ...q,
                    subQuestions: [...(q.subQuestions || []), { id: Date.now(), text: '' }]
                };
            }
            return q;
        });
        setFormData({ ...formData, questions: updatedQuestions });
    };

    const updateSubQuestion = (qId, subId, text) => {
        const updatedQuestions = formData.questions.map(q => {
            if (q.id === qId) {
                const updatedSubs = (q.subQuestions || []).map(sub =>
                    sub.id === subId ? { ...sub, text } : sub
                );
                return { ...q, subQuestions: updatedSubs };
            }
            return q;
        });
        setFormData({ ...formData, questions: updatedQuestions });
    };

    const removeSubQuestion = (qId, subId) => {
        const updatedQuestions = formData.questions.map(q => {
            if (q.id === qId) {
                return {
                    ...q,
                    subQuestions: (q.subQuestions || []).filter(sub => sub.id !== subId)
                };
            }
            return q;
        });
        setFormData({ ...formData, questions: updatedQuestions });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await api.put(`/tasks/${id}`, formData);
            notify.success('Task updated successfully');
            navigate('/tasks');
        } catch (error) {
            console.error("Error updating task", error);
            notify.error('Failed to update task');
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading task details...</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                        Edit Task
                    </h2>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6 transition-colors duration-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Title
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="title"
                                id="title"
                                className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                                value={formData.title}
                                onChange={(e) => {
                                    handleChange(e);
                                    if (errors.title) setErrors({ ...errors, title: '' });
                                }}
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <div className="mt-1">
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {(user?.user?.role === 'admin' || user?.user?.role === 'manager' || user?.user?.role === 'owner') && (
                        <div className="relative flex items-start mt-4">
                            <div className="flex items-center h-5">
                                <input
                                    id="requires_execution_workflow"
                                    name="requires_execution_workflow"
                                    type="checkbox"
                                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                                    checked={formData.requires_execution_workflow}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="requires_execution_workflow" className="font-medium text-gray-700 dark:text-gray-300">
                                    Require Execution Workflow
                                </label>
                                <p className="text-gray-500 dark:text-gray-400">
                                    If enabled, this task must go through the formal execution stages (In Progress -&gt; Local Tested -&gt; Live Deployed -&gt; Completed). Disable for simple task tracking.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Priority
                            </label>
                            <div className="mt-1">
                                <select
                                    id="priority"
                                    name="priority"
                                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        {!formData.is_recurring && (
                            <div className="sm:col-span-3">
                                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Due Date
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="date"
                                        name="due_date"
                                        id="due_date"
                                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                        value={formData.due_date}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="sm:col-span-6">
                            <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Assign To
                            </label>
                            <div className="mt-1">
                                <select
                                    id="assigned_to"
                                    name="assigned_to"
                                    className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.assigned_to ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    value={formData.assigned_to}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (errors.assigned_to) setErrors({ ...errors, assigned_to: '' });
                                    }}
                                >
                                    <option value="">Select a user</option>
                                    {users.filter(u => u.role === 'user').map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.username} ({u.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.assigned_to && <p className="mt-1 text-xs text-red-500">{errors.assigned_to}</p>}
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Project
                            </label>
                            <div className="mt-1">
                                <select
                                    id="project_id"
                                    name="project_id"
                                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    value={formData.project_id}
                                    onChange={handleChange}
                                >
                                    <option value="">None</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Questions Builder */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Structured Questions</h3>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                + Add Question
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.questions && formData.questions.map((q, qIndex) => (
                                <div key={q.id} className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-600">
                                    <div className="flex items-start gap-2">
                                        <span className="mt-2 text-sm font-bold text-gray-500">{qIndex + 1}.</span>
                                        <div className="flex-1 space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <div className="sm:col-span-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter question text..."
                                                        className="block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        value={q.text}
                                                        onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                                    />
                                                </div>
                                                <div className="sm:col-span-1">
                                                    <select
                                                        className="block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        value={q.type}
                                                        onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                                    >
                                                        <option value="text">Text</option>
                                                        <option value="long_text">Long Text</option>
                                                        <option value="boolean">Yes/No</option>
                                                        <option value="number">Number</option>
                                                        <option value="date">Date</option>
                                                        <option value="select">Select</option>
                                                        <option value="checkbox">Checkbox</option>
                                                        <option value="file">File Upload</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Options for Select/Checkbox */}
                                            {(q.type === 'select' || q.type === 'checkbox') && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Options (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Option 1, Option 2, Option 3"
                                                        className="block w-full text-xs border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        value={q.options ? (Array.isArray(q.options) ? q.options.join(', ') : q.options) : ''}
                                                        onChange={(e) => updateQuestion(q.id, 'options', e.target.value.split(',').map(o => o.trim()))}
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center">
                                                <input
                                                    id={`required-${q.id}`}
                                                    type="checkbox"
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                    checked={q.required || false}
                                                    onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                                                />
                                                <label htmlFor={`required-${q.id}`} className="ml-2 block text-xs text-gray-700 dark:text-gray-300">
                                                    Required
                                                </label>
                                            </div>

                                            {/* Sub-questions */}
                                            <div className="mt-3 ml-4 space-y-2 border-l-2 border-gray-100 dark:border-gray-700 pl-3">
                                                {q.subQuestions && q.subQuestions.map((sub, subIndex) => (
                                                    <div key={sub.id} className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-gray-400">{qIndex + 1}.{subIndex + 1}</span>
                                                        <input
                                                            type="text"
                                                            placeholder="Sub-question..."
                                                            className="block w-full text-xs border-gray-300 dark:border-gray-600 rounded-md p-1.5 border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                            value={sub.text}
                                                            onChange={(e) => updateSubQuestion(q.id, sub.id, e.target.value)}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSubQuestion(q.id, sub.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addSubQuestion(q.id)}
                                                    className="text-xs text-primary-600 hover:text-primary-500 font-medium mt-1"
                                                >
                                                    + Add Sub-question
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(q.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {formData.questions && formData.questions.length === 0 && (
                                <p className="text-sm text-gray-500 italic text-center py-4">No structured questions.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Update Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTask;
