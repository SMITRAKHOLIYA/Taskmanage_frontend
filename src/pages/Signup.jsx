import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const role = isOwner ? 'owner' : 'user';
        const result = await register(username, email, password, role, isOwner ? companyName : null);

        if (result.success) {
            navigate('/login');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#07102a] to-[#041022] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00f6ff]/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#a100ff]/20 rounded-full blur-[128px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md w-full space-y-8 relative z-10"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-24 w-24 flex items-center justify-center">
                            <img src="/task_frontend/logo.png" alt="TaskMaster Logo" className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(0,246,255,0.5)]" />
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
                            Create Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-400">
                            Already have an account? <Link to="/login" className="font-medium text-[#00f6ff] hover:text-[#a100ff] transition-colors">Sign in</Link>
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="sr-only">Username</label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 border border-white/10 bg-black/20 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f6ff] focus:border-transparent focus:z-10 sm:text-sm transition-all"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 border border-white/10 bg-black/20 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f6ff] focus:border-transparent focus:z-10 sm:text-sm transition-all"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 border border-white/10 bg-black/20 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f6ff] focus:border-transparent focus:z-10 sm:text-sm transition-all"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="is-owner"
                                    name="is-owner"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#00f6ff] focus:ring-[#00f6ff] border-gray-300 rounded"
                                    checked={isOwner}
                                    onChange={(e) => setIsOwner(e.target.checked)}
                                />
                                <label htmlFor="is-owner" className="ml-2 block text-sm text-gray-300">
                                    Register as Company Owner
                                </label>
                            </div>

                            {isOwner && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    <label htmlFor="company-name" className="sr-only">Company Name</label>
                                    <input
                                        id="company-name"
                                        name="company-name"
                                        type="text"
                                        required={isOwner}
                                        className="appearance-none relative block w-full px-4 py-3 border border-white/10 bg-black/20 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f6ff] focus:border-transparent focus:z-10 sm:text-sm transition-all"
                                        placeholder="Company Name"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                    />
                                </motion.div>
                            )}
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="rounded-lg bg-red-500/10 border border-red-500/20 p-4"
                            >
                                <div className="flex items-center gap-2 text-red-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            </motion.div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-[#00f6ff] to-[#a100ff] hover:shadow-[0_0_20px_rgba(0,246,255,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00f6ff] transition-all duration-300 transform hover:scale-[1.02]"
                            >
                                Sign up
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
