import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../api';

const JoinCompany = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { register } = useContext(AuthContext);

    // Assume invite link is /join?token=companyId or /join?company_id=X&role=Y
    // User requested "secure invite link containing company ID and assigned role".
    // For simplicity, we'll assume token IS the company ID, or params "company_id" and "role" are explicit.
    // If token is used, we'd need an endpoint to decode it.
    // Let's implement looking for explicit params or a token we treat as company ID for MVP.
    const companyIdParam = searchParams.get('company_id') || searchParams.get('token');
    const roleParam = searchParams.get('role') || 'user';
    const emailParam = searchParams.get('email') || '';

    const [companyName, setCompanyName] = useState('...');
    const [loadingCompany, setLoadingCompany] = useState(true);
    const [companyValid, setCompanyValid] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: emailParam, // Pre-fill if available
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (companyIdParam) {
            fetchCompanyDetails(companyIdParam);
        } else {
            setLoadingCompany(false);
        }
    }, [companyIdParam]);

    const fetchCompanyDetails = async (id) => {
        try {
            // We need a public endpoint to get company name. AuthController added getCompanyDetails via ?id=
            const res = await api.get(`/auth/company?id=${id}`);
            setCompanyName(res.data.name);
            setCompanyValid(true);
        } catch (err) {
            setCompanyName('Unknown Company');
            setSubmitError('Invalid invitation link.');
        } finally {
            setLoadingCompany(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.username) newErrors.username = 'Full Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);

        try {
            // Register as 'user' (or role param) linked to companyIdParam
            const res = await register(
                formData.username,
                formData.email,
                formData.password,
                roleParam,
                null, // companyName (not creating one)
                null, // size
                null, // industry
                companyIdParam // companyId
            );

            if (res.success) {
                // Determine redirect based on role
                // Since register doesn't return user role in 'user' object until login, 
                // we assume successful registration means we can redirect to login or dashboard if we had auto-login.
                // Current flow: Go to login.
                navigate('/login', { state: { message: 'Account created! Please log in.' } });
            } else {
                setSubmitError(res.message);
            }
        } catch (err) {
            setSubmitError('Registration failed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingCompany) {
        return <div className="min-h-screen flex items-center justify-center text-white">Verifying invitation...</div>;
    }

    if (!companyValid && companyIdParam) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white flex-col">
                <div className="bg-red-500/10 p-8 rounded-xl border border-red-500/20 text-center">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Invalid Invitation</h2>
                    <p className="text-gray-400">{submitError || "This invite link appears to be invalid or expired."}</p>
                    <button onClick={() => navigate('/auth-entry')} className="mt-4 px-4 py-2 bg-white/10 rounded hover:bg-white/20 transition">Back to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#07102a] to-[#041022] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00f6ff]/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#a100ff]/20 rounded-full blur-[128px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white">Join {companyName}</h2>
                    <p className="text-gray-400 text-sm mt-2">
                        You have been invited to join as <span className="text-[#a100ff] font-bold uppercase">{roleParam}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                        <input
                            name="username" type="text"
                            className={`w-full bg-black/20 border ${errors.username ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500`}
                            value={formData.username} onChange={handleChange} placeholder="John Doe"
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Work Email</label>
                        <input
                            name="email" type="email"
                            className={`w-full bg-black/20 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 ${emailParam ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={formData.email} onChange={handleChange} placeholder="john@company.com"
                            readOnly={!!emailParam}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Create Password</label>
                        <input
                            name="password" type="password"
                            className={`w-full bg-black/20 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500`}
                            value={formData.password} onChange={handleChange} placeholder="••••••"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                        <input
                            name="confirmPassword" type="password"
                            className={`w-full bg-black/20 border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500`}
                            value={formData.confirmPassword} onChange={handleChange} placeholder="••••••"
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>

                    {submitError && <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">{submitError}</div>}

                    <button
                        type="submit" disabled={submitting}
                        className="w-full mt-2 bg-[#a100ff] hover:bg-[#8b00db] text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    >
                        {submitting ? 'Joining Team...' : 'Create Account & Join'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-gray-500 text-sm">
                        Already have an account? <Link to="/login" className="text-[#00f6ff] hover:text-[#a100ff]">Log In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default JoinCompany;
