
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Modal from '../components/Modal';
import PersonForm from '../components/customers/PersonForm';

import { useNotification } from '../context/NotificationContext';

const DetailsPage = ({ type }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { notify } = useNotification();

    // Shared State
    const [data, setData] = useState(null); // stores group or customer
    const [secondaryData, setSecondaryData] = useState(null); // stores members or linkedCompany
    const [loading, setLoading] = useState(true);

    // Group Specific State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewedMember, setViewedMember] = useState(null);
    const [viewedMemberCompany, setViewedMemberCompany] = useState(null);

    useEffect(() => {
        fetchDetails();
    }, [id, type]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            if (type === 'group') {
                const [groupRes, membersRes] = await Promise.all([
                    api.get(`/customer-groups/${id}`),
                    api.get(`/group-persons/group/${id}`)
                ]);
                setData(groupRes.data);
                setSecondaryData(membersRes.data);
            } else if (type === 'customer' || type === 'member') {
                const isMember = type === 'member';
                const endpoint = isMember ? `/group-persons/${id}` : `/customers/${id}`;
                const linkedEndpoint = isMember
                    ? `/linked-companies/owner/group_person/${id}`
                    : `/linked-companies/owner/customer/${id}`;

                // Fetch Details
                const mainRes = await api.get(endpoint);
                if (!mainRes.data) throw new Error(`${isMember ? 'Member' : 'Customer'} not found`);
                setData(mainRes.data);

                // Fetch Linked Company Details
                const companyRes = await api.get(linkedEndpoint);
                if (companyRes.data && companyRes.data.length > 0) {
                    setSecondaryData(companyRes.data[0]);
                } else {
                    setSecondaryData(null);
                }
            }
        } catch (error) {
            console.error("Error fetching details", error);
            notify.error(`Failed to load ${type} details`);
            if (type === 'customer') navigate('/customers');
        } finally {
            setLoading(false);
        }
    };

    // Group Actions
    const handleDeleteMember = async (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            await api.delete(`/group-persons/${memberId}`);
            notify.success("Member removed");
            fetchDetails();
        } catch (error) {
            console.error("Delete error", error);
            notify.error("Failed to delete member");
        }
    };

    const handleEdit = (person) => {
        setSelectedPerson(person);
        setIsModalOpen(true);
    };

    const handleView = async (person) => {
        setViewedMember(person);
        setViewedMemberCompany(null); // Reset previous
        setIsViewModalOpen(true);
        try {
            const res = await api.get(`/linked-companies/owner/group_person/${person.id}`);
            if (res.data && res.data.length > 0) {
                setViewedMemberCompany(res.data[0]);
            }
        } catch (error) {
            console.error("Error fetching member company details", error);
        }
    };

    const handleAdd = () => {
        setSelectedPerson(null);
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (!data) return <div className="p-6 text-center text-red-500">{type === 'group' ? 'Group' : (type === 'member' ? 'Member' : 'Customer')} not found</div>;

    const navTarget = type === 'member' ? `/customer-groups/${data.group_id}` : '/customers';
    // Checking GroupDetails: onClick={() => navigate('/customers')}
    // Checking CustomerDetails: onClick={() => navigate('/customers')}
    // Perfect.

    const title = type === 'group' ? data.name : `${data.first_name} ${data.last_name}`;
    const subtitle = type === 'group' ? 'Group Management' : (type === 'member' ? 'Member Details' : 'Customer Details');

    return (
        <div className="w-full p-2 md:p-6 space-y-6">
            <header className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(navTarget)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{subtitle}</p>
                </div>
            </header>

            {type === 'group' ? (
                /* Group Specific Content */
                <>
                    <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Group Members</h2>
                        <button
                            onClick={handleAdd}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Member
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Name</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Contact</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">PAN</th>
                                        <th className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {!secondaryData || secondaryData.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No members in this group yet.</td>
                                        </tr>
                                    ) : (
                                        secondaryData.map((person) => (
                                            <tr
                                                key={person.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/group-members/${person.id}`)}
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {person.first_name} {person.last_name}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                    {person.whatsapp_number || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                    {person.pan_card_number || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(person);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteMember(person.id);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedPerson ? "Edit Member" : "Add Group Member"}>
                        <PersonForm
                            type="group_person"
                            groupId={id}
                            initialData={selectedPerson}
                            onClose={() => setIsModalOpen(false)}
                            onSuccess={fetchDetails}
                        />
                    </Modal>

                    <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Member Details">
                        {viewedMember && (
                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">Personal Information</h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-4">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</span>
                                            <span className="text-sm text-gray-900 dark:text-white col-span-2">{viewedMember.first_name} {viewedMember.last_name}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">WhatsApp</span>
                                            <span className="text-sm text-gray-900 dark:text-white col-span-2">{viewedMember.whatsapp_number || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">PAN Card</span>
                                            <span className="text-sm text-gray-900 dark:text-white col-span-2">{viewedMember.pan_card_number || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined</span>
                                            <span className="text-sm text-gray-900 dark:text-white col-span-2">{new Date(viewedMember.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Banking */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">Personal Banking</h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-4">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Name</span>
                                            <span className="text-sm text-gray-900 dark:text-white col-span-2">{viewedMember.personal_bank_account_name || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</span>
                                            <span className="text-sm text-gray-900 dark:text-white col-span-2">{viewedMember.personal_bank_name || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">IFSC Code</span>
                                            <span className="text-sm text-gray-900 dark:text-white col-span-2">{viewedMember.personal_ifsc_code || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank ID</span>
                                            <span className="text-sm text-gray-900 dark:text-white col-span-2">{viewedMember.personal_bank_id || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Company Details */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">Company Details</h4>
                                    {viewedMemberCompany ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-3 gap-4">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</span>
                                                <span className="text-sm text-gray-900 dark:text-white col-span-2">{viewedMemberCompany.company_name}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">GST Number</span>
                                                <span className="text-sm text-gray-900 dark:text-white col-span-2">{viewedMemberCompany.gst_number || 'N/A'}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">PAN Number</span>
                                                <span className="text-sm text-gray-900 dark:text-white col-span-2">{viewedMemberCompany.pan_number || 'N/A'}</span>
                                            </div>
                                            <div className="pt-2">
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Company Bank</p>
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Name</span>
                                                        <span className="text-sm text-gray-900 dark:text-white col-span-2">{viewedMemberCompany.bank_account_name || 'N/A'}</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</span>
                                                        <span className="text-sm text-gray-900 dark:text-white col-span-2">{viewedMemberCompany.bank_name || 'N/A'}</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">IFSC Code</span>
                                                        <span className="text-sm text-gray-900 dark:text-white col-span-2">{viewedMemberCompany.ifsc_code || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No linked company details found.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </Modal>
                </>
            ) : (
                /* Customer Specific Content */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Details Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Personal Information</h2>
                        <dl className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                                <dd className="text-sm text-gray-900 dark:text-white col-span-2">{data.first_name} {data.last_name}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">WhatsApp</dt>
                                <dd className="text-sm text-gray-900 dark:text-white col-span-2">{data.whatsapp_number || 'N/A'}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">PAN Card</dt>
                                <dd className="text-sm text-gray-900 dark:text-white col-span-2">{data.pan_card_number || 'N/A'}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined</dt>
                                <dd className="text-sm text-gray-900 dark:text-white col-span-2">{new Date(data.created_at).toLocaleDateString()}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Personal Banking Details Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Personal Banking</h2>
                        <dl className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Name</dt>
                                <dd className="text-sm text-gray-900 dark:text-white col-span-2">{data.personal_bank_account_name || 'N/A'}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</dt>
                                <dd className="text-sm text-gray-900 dark:text-white col-span-2">{data.personal_bank_name || 'N/A'}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">IFSC Code</dt>
                                <dd className="text-sm text-gray-900 dark:text-white col-span-2">{data.personal_ifsc_code || 'N/A'}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank ID</dt>
                                <dd className="text-sm text-gray-900 dark:text-white col-span-2">{data.personal_bank_id || 'N/A'}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Company/Banking Details Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Company & Banking Details</h2>
                        {secondaryData ? (
                            <dl className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</dt>
                                    <dd className="text-sm text-gray-900 dark:text-white col-span-2">{secondaryData.company_name}</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">GST Number</dt>
                                    <dd className="text-sm text-gray-900 dark:text-white col-span-2">{secondaryData.gst_number || 'N/A'}</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Company PAN</dt>
                                    <dd className="text-sm text-gray-900 dark:text-white col-span-2">{secondaryData.pan_number || 'N/A'}</dd>
                                </div>
                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Bank Account</h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Name</dt>
                                            <dd className="text-sm text-gray-900 dark:text-white col-span-2">{secondaryData.bank_account_name || 'N/A'}</dd>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</dt>
                                            <dd className="text-sm text-gray-900 dark:text-white col-span-2">{secondaryData.bank_name || 'N/A'}</dd>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">IFSC Code</dt>
                                            <dd className="text-sm text-gray-900 dark:text-white col-span-2">{secondaryData.ifsc_code || 'N/A'}</dd>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank ID</dt>
                                            <dd className="text-sm text-gray-900 dark:text-white col-span-2">{secondaryData.bank_id || 'N/A'}</dd>
                                        </div>
                                    </div>
                                </div>
                            </dl>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No company or banking details linked.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailsPage;
