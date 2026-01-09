import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LinkedCompanyForm = ({ register, errors, setValue, initialData = null }) => {

    useEffect(() => {
        if (initialData) {
            setValue('company_name', initialData.company_name);
            setValue('gst_number', initialData.gst_number);
            setValue('pan_number', initialData.pan_number);
            setValue('bank_account_name', initialData.bank_account_name);
            setValue('bank_name', initialData.bank_name);
            setValue('ifsc_code', initialData.ifsc_code);
            setValue('bank_id', initialData.bank_id);
        }
    }, [initialData, setValue]);

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Company Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Company Name *</label>
                        <input
                            {...register('company_name', { required: 'Company Name is required' })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Enter Company Name"
                        />
                        {errors.company_name && <span className="text-red-500 text-xs">{errors.company_name.message}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">GST Number</label>
                        <input
                            {...register('gst_number', {
                                maxLength: { value: 15, message: 'GST must be 15 characters' },
                                pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GST format' }
                            })}
                            maxLength={15}
                            style={{ textTransform: 'uppercase' }}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500 uppercase"
                            placeholder="Enter GST Number"
                        />
                        {errors.gst_number && <span className="text-red-500 text-xs">{errors.gst_number.message}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">PAN Number</label>
                        <input
                            {...register('pan_number', {
                                maxLength: { value: 10, message: 'PAN must be exactly 10 characters' },
                                pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format' }
                            })}
                            maxLength={10}
                            style={{ textTransform: 'uppercase' }}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500 uppercase"
                            placeholder="Enter PAN Number"
                        />
                        {errors.pan_number && <span className="text-red-500 text-xs">{errors.pan_number.message}</span>}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Banking Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Bank Account Name</label>
                        <input
                            {...register('bank_account_name')}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Account Holder Name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Bank Name</label>
                        <input
                            {...register('bank_name')}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Bank Name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">IFSC Code</label>
                        <input
                            {...register('ifsc_code', {
                                maxLength: { value: 11, message: 'IFSC must be 11 characters' }
                            })}
                            maxLength={11}
                            style={{ textTransform: 'uppercase' }}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500 uppercase"
                            placeholder="IFSC Code"
                        />
                        {errors.ifsc_code && <span className="text-red-500 text-xs">{errors.ifsc_code.message}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Bank ID</label>
                        <input
                            {...register('bank_id')}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all py-2.5 px-4 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Bank unique ID"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkedCompanyForm;
