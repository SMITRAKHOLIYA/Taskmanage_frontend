import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

const CompanySignup = () => {
    const navigate = useNavigate();
    const { register } = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        companySize: '1-5',
        industry: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.username) newErrors.username = 'Full Name is required';
        if (!formData.email) newErrors.email = 'Work Email is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.companyName) newErrors.companyName = 'Company Name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
    };

    const handleBack = () => {
        if (step === 2) setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateStep2()) return;

        setLoading(true);
        try {
            const res = await register(
                formData.username,
                formData.email,
                formData.password,
                'owner',
                formData.companyName,
                // Pass extra fields if register supports them, or modify AuthContext to pass object
                // AuthContext register definition: async (username, email, password, role, companyName) => { ... }
                // I need to make sure AuthContext supports passing these extras or packs them.
                // For now, I'll pass them in a way AuthContext understands, or rely on my backend change handling the payload structure.
                // Wait, AuthContext likely sends JSON. I should check AuthContext. 
                // Assumption: I'll modify AuthContext to accept an object or extra args.
                // HACK: I'll overload the function call or check AuthContext in next step.
                // Current AuthContext signature in my memory: register(username, email, password, role, companyName)
                // My backend change: looks for `company_size` in POST/JSON.
                // I will update AuthContext after this file.
                formData.companySize, // I'll update register to accept these
                formData.industry
            );

            if (res.success) {
                // Show success screen or redirect
                // Design asks for Success Screen.
                setStep(3); // 3 = Success
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError('Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Personal Info
    const renderStep1 = () => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
        >
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
                    className={`w-full bg-black/20 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500`}
                    value={formData.email} onChange={handleChange} placeholder="john@company.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                    <input
                        name="password" type="password"
                        className={`w-full bg-black/20 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500`}
                        value={formData.password} onChange={handleChange} placeholder="••••••"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Confirm</label>
                    <input
                        name="confirmPassword" type="password"
                        className={`w-full bg-black/20 border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500`}
                        value={formData.confirmPassword} onChange={handleChange} placeholder="••••••"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
            </div>
            <button
                onClick={handleNext}
                className="w-full mt-6 bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-all"
            >
                Continue to Company Setup
            </button>
        </motion.div>
    );

    // Step 2: Company Info
    const renderStep2 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
        >
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
                <input
                    name="companyName" type="text"
                    className={`w-full bg-black/20 border ${errors.companyName ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500`}
                    value={formData.companyName} onChange={handleChange} placeholder="Acme Inc."
                />
                {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Company Size</label>
                <select
                    name="companySize"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    value={formData.companySize} onChange={handleChange}
                >
                    <option value="1-5">1-5 employees</option>
                    <option value="6-20">6-20 employees</option>
                    <option value="21-50">21-50 employees</option>
                    <option value="50+">50+ employees</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Industry (Optional)</label>
                <input
                    name="industry" type="text"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    value={formData.industry} onChange={handleChange} placeholder="e.g. Technology, Healthcare"
                />
            </div>

            <div className="flex gap-4 mt-6">
                <button
                    onClick={handleBack}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl transition-all"
                >
                    Back
                </button>
                <button
                    onClick={handleSubmit} disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#00f6ff] to-[#a100ff] text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,246,255,0.4)] transition-all"
                >
                    {loading ? 'Creating...' : 'Create Account'}
                </button>
            </div>
        </motion.div>
    );

    // Step 3: Success Screen
    const renderSuccess = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
        >
            <div className="mx-auto h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">You're all set!</h2>
            <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                <span className="text-white font-bold">{formData.companyName}</span> has been created and you are the owner.
            </p>
            <button
                onClick={() => navigate('/owner-dashboard')}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-all mb-4"
            >
                Go to Dashboard
            </button>
            <button
                onClick={() => navigate('/owner-dashboard')} // Or invite flow
                className="text-gray-500 hover:text-white text-sm"
            >
                Skip for now
            </button>
        </motion.div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#07102a] to-[#041022] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00f6ff]/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#a100ff]/20 rounded-full blur-[128px] pointer-events-none" />

            <motion.div
                className="max-w-md w-full relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
            >
                {/* Header (Hidden on Success) */}
                {step < 3 && (
                    <div className="text-center mb-8">
                        <div className="flex justify-center gap-2 mb-2">
                            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-[#00f6ff]' : 'bg-white/10'}`} />
                            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-[#00f6ff]' : 'bg-white/10'}`} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mt-4">
                            {step === 1 ? 'Personal Details' : 'Company Setup'}
                        </h2>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderSuccess()}
                </AnimatePresence>

                {error && <p className="text-red-500 text-center mt-4">{error}</p>}

                {step === 1 && (
                    <div className="text-center mt-6">
                        <p className="text-gray-500 text-sm">
                            Already have an account? <Link to="/login" className="text-[#00f6ff] hover:text-[#a100ff]">Log In</Link>
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CompanySignup;
