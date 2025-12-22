import React from 'react';

const Footer = () => {
    return (
        <footer className="py-12 px-6 border-t border-white/10 bg-[#020617]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#00f6ff] to-[#a100ff] flex items-center justify-center font-bold text-sm">TM</div>
                    <span className="font-bold text-xl">TaskMaster</span>
                </div>
                <div className="flex gap-8 text-gray-400 text-sm">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>
                <div className="text-gray-500 text-sm">
                    © 2025 TaskMaster Inc.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
