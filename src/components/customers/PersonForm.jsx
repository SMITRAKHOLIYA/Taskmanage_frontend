import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';
import LinkedCompanyForm from './LinkedCompanyForm';
import { useNotification } from '../../context/NotificationContext';

const PersonForm = ({ type, initialData = null, onClose, onSuccess, groupId = null }) => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const { notify } = useNotification();
    const [linkedCompanyId, setLinkedCompanyId] = useState(null);

    const isCustomer = type === 'customer';
    const entityName = isCustomer ? 'Customer' : 'Member';

    // Initial load handling
    useEffect(() => {
        if (initialData) {
            setValue('first_name', initialData.first_name);
            setValue('last_name', initialData.last_name);
            setValue('whatsapp_number', initialData.whatsapp_number);
            setValue('pan_card_number', initialData.pan_card_number);
            setValue('personal_bank_account_name', initialData.personal_bank_account_name);
            setValue('personal_bank_name', initialData.personal_bank_name);
            setValue('personal_ifsc_code', initialData.personal_ifsc_code);
            setValue('personal_bank_id', initialData.personal_bank_id);
            fetchLinkedCompany(initialData.id);
        }
    }, [initialData, setValue]);

    const fetchLinkedCompany = async (id) => {
        try {
            const ownerType = isCustomer ? 'customer' : 'group_person';
            const res = await api.get(`/linked-companies/owner/${ownerType}/${id}`);
            if (res.data && res.data.length > 0) {
                const company = res.data[0];
                setLinkedCompanyId(company.id);
                // Pre-fill company form fields
                setValue('company_name', company.company_name);
                setValue('gst_number', company.gst_number);
                setValue('pan_number', company.pan_number);
                setValue('bank_account_name', company.bank_account_name);
                setValue('bank_name', company.bank_name);
                setValue('ifsc_code', company.ifsc_code);
                setValue('bank_id', company.bank_id);
            }
        } catch (error) {
            console.error("Error fetching linked company", error);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // 1. Create/Update Entity
            let entityId;
            const payload = {
                first_name: data.first_name,
                last_name: data.last_name,
                whatsapp_number: data.whatsapp_number,
                pan_card_number: data.pan_card_number,
                personal_bank_account_name: data.personal_bank_account_name,
                personal_bank_name: data.personal_bank_name,
                personal_ifsc_code: data.personal_ifsc_code,
                personal_bank_id: data.personal_bank_id
            };

            if (!isCustomer) {
                payload.group_id = groupId;
            }

            if (initialData) {
                const endpoint = isCustomer ? `/customers/${initialData.id}` : `/group-persons/${initialData.id}`;
                await api.put(endpoint, payload);
                entityId = initialData.id;
            } else {
                const endpoint = isCustomer ? '/customers' : '/group-persons';
                const res = await api.post(endpoint, payload);
                entityId = res.data.id;
            }

            // 2. Create/Update Linked Company (if company name provided)
            if (data.company_name) {
                const companyData = {
                    owner_type: isCustomer ? 'customer' : 'group_person',
                    owner_id: entityId,
                    company_name: data.company_name,
                    gst_number: data.gst_number,
                    pan_number: data.pan_number,
                    bank_account_name: data.bank_account_name,
                    bank_name: data.bank_name,
                    ifsc_code: data.ifsc_code,
                    bank_id: data.bank_id
                };

                if (linkedCompanyId) {
                    await api.put(`/linked-companies/${linkedCompanyId}`, companyData);
                } else {
                    await api.post('/linked-companies', companyData);
                }
            }

            notify.success(initialData ? `${entityName} updated successfully` : `${entityName} created successfully`);
            onSuccess();
            onClose();

        } catch (error) {
            console.error(error);
            notify.error(error.response?.data?.message || `Error saving ${entityName}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">First Name *</label>
                        <input
                            {...register('first_name', { required: 'First Name is required' })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="First Name"
                        />
                        {errors.first_name && <span className="text-red-500 text-xs">{errors.first_name.message}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Last Name *</label>
                        <input
                            {...register('last_name', { required: 'Last Name is required' })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Last Name"
                        />
                        {errors.last_name && <span className="text-red-500 text-xs">{errors.last_name.message}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">WhatsApp Number</label>
                        <input
                            {...register('whatsapp_number', {
                                maxLength: { value: 15, message: 'Max 15 digits' },
                                pattern: { value: /^[0-9+]+$/, message: 'Invalid phone format' }
                            })}
                            maxLength={15}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="WhatsApp Number"
                        />
                        {errors.whatsapp_number && <span className="text-red-500 text-xs">{errors.whatsapp_number.message}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">PAN Card Number</label>
                        <input
                            {...register('pan_card_number', {
                                maxLength: { value: 10, message: 'PAN must be exactly 10 characters' },
                                pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format (e.g., ABCDE1234F)' }
                            })}
                            maxLength={10}
                            style={{ textTransform: 'uppercase' }}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500 uppercase"
                            placeholder="Personal PAN"
                        />
                        {errors.pan_card_number && <span className="text-red-500 text-xs">{errors.pan_card_number.message}</span>}
                    </div>
                </div>
            </div>

            {/* Personal Banking Details */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Personal Banking Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Bank Account Name</label>
                        <input
                            {...register('personal_bank_account_name')}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Account Holder Name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Bank Name</label>
                        <input
                            {...register('personal_bank_name')}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Bank Name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">IFSC Code</label>
                        <input
                            {...register('personal_ifsc_code', {
                                maxLength: { value: 11, message: 'IFSC must be 11 characters' }
                            })}
                            maxLength={11}
                            style={{ textTransform: 'uppercase' }}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500 uppercase"
                            placeholder="IFSC Code"
                        />
                        {errors.personal_ifsc_code && <span className="text-red-500 text-xs">{errors.personal_ifsc_code.message}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Bank ID</label>
                        <input
                            {...register('personal_bank_id')}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Bank unique ID"
                        />
                    </div>
                </div>
            </div>

            {/* Reusable Company/Banking Form */}
            <LinkedCompanyForm register={register} errors={errors} setValue={setValue} />

            <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-primary-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </span>
                    ) : (
                        initialData ? `Update ${entityName}` : `Create ${entityName}`
                    )}
                </button>
            </div>
        </div>
    );
};

export default PersonForm;
