import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';

const LandingNavbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const { user } = useContext(AuthContext);

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

                {/* Desktop Nav */}
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

                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <Link
                            to="/dashboard"
                            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00f6ff] to-[#a100ff] text-white font-bold text-sm shadow-[0_0_20px_rgba(161,0,255,0.5)] hover:shadow-[0_0_30px_rgba(0,246,255,0.6)] hover:scale-105 transition-all duration-300"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-white hover:text-[#00f6ff] transition-colors">
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00f6ff] to-[#a100ff] text-white font-bold text-sm shadow-[0_0_20px_rgba(161,0,255,0.5)] hover:shadow-[0_0_30px_rgba(0,246,255,0.6)] hover:scale-105 transition-all duration-300"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden bg-[#020617] border-b border-white/10 px-6 py-4 overflow-hidden"
                >
                    <div className="flex flex-col gap-4">
                        {['Features', 'How it Works', 'Stories'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-base font-medium text-gray-300 hover:text-[#00f6ff] transition-colors py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item}
                            </a>
                        ))}
                        <div className="h-px bg-white/10 my-2" />
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="block text-center w-full px-5 py-3 rounded-xl bg-gradient-to-r from-[#00f6ff] to-[#a100ff] text-white font-bold shadow-[0_0_20px_rgba(161,0,255,0.5)]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/login"
                                    className="block text-center w-full py-3 text-white font-medium hover:text-[#00f6ff] border border-white/10 rounded-xl"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="block text-center w-full px-5 py-3 rounded-xl bg-gradient-to-r from-[#00f6ff] to-[#a100ff] text-white font-bold shadow-[0_0_20px_rgba(161,0,255,0.5)]"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

export default LandingNavbar;
