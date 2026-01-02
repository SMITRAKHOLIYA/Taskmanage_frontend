import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api, { MEDIA_URL } from '../api';

const Profile = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profile_pic', file);

        setUploading(true);
        setMessage('');

        try {
            const response = await api.post('/users/upload-profile-pic', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Profile picture updated successfully!');
            refreshUser();
        } catch (error) {
            console.error(error);
            setMessage('Failed to upload profile picture.');
        } finally {
            setUploading(false);
        }
    };

    const generateAvatar = async () => {
        setUploading(true);
        setMessage('');
        const username = user?.user?.username || 'user';
        // Using DiceBear for "Bitmoji-style" avatars
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        try {
            await api.post('/users/upload-profile-pic', { avatar_url: avatarUrl });
            setMessage('Avatar generated successfully!');
            refreshUser();
        } catch (error) {
            console.error(error);
            setMessage('Failed to update avatar.');
        } finally {
            setUploading(false);
        }
    };

    if (!user || !user.user) return <div className="text-white">Loading...</div>;

    const usernameDisplay = user.user.username || 'User';

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative"
            >
                <button
                    onClick={() => navigate('/dashboard')}
                    className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Back to Dashboard"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#00f6ff] shadow-[0_0_20px_rgba(0,246,255,0.3)]">
                            {user.user.profile_pic ? (
                                <img
                                    src={user.user.profile_pic.startsWith('http') ? user.user.profile_pic : `${MEDIA_URL}${user.user.profile_pic}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#00f6ff] to-[#a100ff] flex items-center justify-center text-4xl font-bold text-white">
                                    {usernameDisplay.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-[#a100ff] p-2 rounded-full cursor-pointer hover:bg-[#b24bf3] transition-colors shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                            </svg>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                        </label>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-white">{usernameDisplay}</h2>
                    <p className="text-gray-400">{user.user.email}</p>
                    {user.user.company_name && (
                        <p className="text-[#00f6ff] text-sm mt-1 uppercase tracking-wider font-semibold">
                            {user.user.company_name}
                        </p>
                    )}

                    <div className="mt-8 w-full max-w-md space-y-4">
                        <button
                            onClick={generateAvatar}
                            disabled={uploading}
                            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                            </svg>
                            {uploading ? 'Processing...' : 'Generate Bitmoji Avatar'}
                        </button>
                    </div>

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-4 p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}
                        >
                            {message}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
