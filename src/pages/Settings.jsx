import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const Settings = () => {
    const [formData, setFormData] = useState({
        company_name: '',
        company_address: '',
        company_phone: '',
        company_email: ''
    });
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            setFormData(response.data);
            setInitialData(response.data);
        } catch (error) {
            console.error("Error fetching settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await api.post('/settings', formData);
            setInitialData(formData);
            setMessage('Company details updated successfully!');
        } catch (error) {
            setMessage('Failed to update settings.');
            console.error("Error updating settings", error);
        }
    };

    const isModified = JSON.stringify(formData) !== JSON.stringify(initialData);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Company Settings
                    </h2>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6 transition-colors duration-200">
                {message && (
                    <div className={`mb-4 p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Company Name
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="company_name"
                                id="company_name"
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Address
                        </label>
                        <div className="mt-1">
                            <textarea
                                name="company_address"
                                id="company_address"
                                rows={3}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                value={formData.company_address}
                                onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Phone
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="company_phone"
                                    id="company_phone"
                                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    value={formData.company_phone}
                                    onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="company_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    name="company_email"
                                    id="company_email"
                                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    value={formData.company_email}
                                    onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!isModified}
                            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                                ${!isModified ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'}`}
                        >
                            Save Company Details
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
