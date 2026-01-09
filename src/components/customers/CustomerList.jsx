import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import Modal from '../Modal';
import PersonForm from './PersonForm';
import { useNotification } from '../../context/NotificationContext';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const { notify } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/customers');
            setCustomers(res.data);
        } catch (error) {
            console.error("Error fetching customers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this customer?")) return;
        try {
            await api.delete(`/customers/${id}`);
            notify.success("Customer deleted");
            fetchCustomers();
        } catch (error) {
            console.error("Delete error", error);
            notify.error("Failed to delete customer");
        }
    };

    const handleEdit = (customer, e) => {
        e.stopPropagation();
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedCustomer(null);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        fetchCustomers();
    };

    const handleRowClick = (id) => {
        navigate(`/customers/${id}`);
    };

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Customers</h2>
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Customer
                </button>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Contact</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">PAN</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Created At</th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading customers...</td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No customers found.</td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                        onClick={() => handleRowClick(customer.id)}
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {customer.first_name} {customer.last_name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {customer.whatsapp_number || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {customer.pan_card_number || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={(e) => handleEdit(customer, e)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(customer.id, e)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCustomer ? "Edit Customer" : "Add New Customer"}>
                <PersonForm
                    type="customer"
                    initialData={selectedCustomer}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            </Modal>
        </div>
    );
};

export default CustomerList;
