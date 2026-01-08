import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

const AuthEntry = () => {
    const navigate = useNavigate();
    const [inviteCode, setInviteCode] = useState('');
    const [showInviteInput, setShowInviteInput] = useState(false);

    const handleJoinWithCode = (e) => {
        e.preventDefault();
        if (inviteCode) {
            // Assume code is company_id for now, or decode it here.
            // Simplified: "invite code" -> navigate to /join?token=x or just pass logic
            // For this implementation, let's assume direct company ID or encoded string
            navigate(`/join?token=${inviteCode}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#07102a] to-[#041022] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00f6ff]/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#a100ff]/20 rounded-full blur-[128px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full space-y-8 relative z-10"
            >
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 flex items-center justify-center mb-6">
                        <img src={logo} alt="TaskMaster Logo" className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(0,246,255,0.5)]" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                        Welcome to TaskMaster
                    </h2>
                    <p className="text-gray-400">Choose how you want to get started</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* Create New Company Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 cursor-pointer hover:border-primary-500/50 transition-all group"
                        onClick={() => navigate('/signup-company')}
                    >
                        <div className="h-12 w-12 bg-primary-600/20 rounded-lg flex items-center justify-center mb-4 text-primary-400 group-hover:text-primary-300 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Create New Company</h3>
                        <p className="text-gray-400 text-sm">
                            I am a business owner or team lead setting up a new workspace for my organization.
                        </p>
                        <div className="mt-6 flex items-center text-primary-400 text-sm font-bold group-hover:text-primary-300">
                            Get Started <span className="ml-2">→</span>
                        </div>
                    </motion.div>

                    {/* Join Existing Company Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 cursor-pointer hover:border-[#a100ff]/50 transition-all group"
                        onClick={() => setShowInviteInput(!showInviteInput)}
                    >
                        <div className="h-12 w-12 bg-[#a100ff]/20 rounded-lg flex items-center justify-center mb-4 text-[#a100ff] group-hover:text-[#c084fc] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Join Existing Company</h3>
                        <p className="text-gray-400 text-sm">
                            I have been invited to join a team. I have an invite link or code.
                        </p>
                        <div className="mt-6 flex items-center text-[#a100ff] text-sm font-bold group-hover:text-[#c084fc]">
                            Join Team <span className="ml-2">→</span>
                        </div>
                    </motion.div>
                </div>

                {/* Invite Code Input (Expandable) */}
                {showInviteInput && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/40 border border-white/10 rounded-xl p-6 mt-6"
                    >
                        <h4 className="text-white font-bold mb-4">Enter Invite Code</h4>
                        <form onSubmit={handleJoinWithCode} className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Paste your invite code here..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#a100ff] transition-colors"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-[#a100ff] hover:bg-[#8b00db] text-white font-bold rounded-lg transition-colors"
                            >
                                Continue
                            </button>
                        </form>
                        <p className="text-xs text-gray-500 mt-2">
                            Check your email for an invitation link or ask your administrator.
                        </p>
                    </motion.div>
                )}

                <div className="text-center mt-8">
                    <p className="text-gray-500">
                        Already have an account? <span onClick={() => navigate('/login')} className="text-white hover:text-primary-400 cursor-pointer font-bold transition-colors">Log In</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthEntry;
