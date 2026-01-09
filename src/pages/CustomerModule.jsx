import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerList from '../components/customers/CustomerList';
import GroupList from '../components/customers/GroupList';

const CustomerModule = () => {
    const [activeTab, setActiveTab] = useState('customers');

    return (
        <div className="w-full p-2 md:p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage customers, groups, and linked entities.</p>
                </div>

                {/* Tabs */}
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex space-x-1">
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'customers'
                                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Customers
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'groups'
                                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Groups
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'customers' ? <CustomerList /> : <GroupList />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CustomerModule;
