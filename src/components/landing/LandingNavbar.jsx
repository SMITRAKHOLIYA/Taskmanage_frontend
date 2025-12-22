import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const LandingNavbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navBackground = isScrolled ? 'bg-[#020617]/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent';

    return (
        <motion.nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBackground}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#00f6ff] to-[#a100ff] flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(0,246,255,0.5)]">
                        TM
                    </div>
                    <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        TaskMaster
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    {['Features', 'How it Works', 'Stories'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-sm font-medium text-gray-300 hover:text-[#00f6ff] transition-colors relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00f6ff] transition-all group-hover:w-full" />
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-medium text-white hover:text-[#00f6ff] transition-colors">
                        Login
                    </Link>
                    <Link
                        to="/signup"
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00f6ff] to-[#a100ff] text-white font-bold text-sm shadow-[0_0_20px_rgba(161,0,255,0.5)] hover:shadow-[0_0_30px_rgba(0,246,255,0.6)] hover:scale-105 transition-all duration-300"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
};

export default LandingNavbar;
