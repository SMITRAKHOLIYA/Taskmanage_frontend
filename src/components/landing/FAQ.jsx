import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        { q: "Is TaskMaster free?", a: "Yes, we offer a generous free tier for individuals and small teams. You can upgrade anytime for advanced features." },
        { q: "Can I use it offline?", a: "Absolutely. TaskMaster's PWA technology allows you to work offline. Your data syncs automatically when you reconnect." },
        { q: "Is my data secure?", a: "We use military-grade AES-256 encryption to keep your tasks private. Your data is yours alone." },
        { q: "Does it integrate with other tools?", a: "Yes, we integrate with Slack, GitHub, Google Calendar, and more to streamline your workflow." },
        { q: "Can I invite my team?", a: "Of course! Collaboration is at the heart of TaskMaster. Invite unlimited team members and manage permissions easily." },
    ];

    return (
        <section className="py-24 px-6 relative">
            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00f6ff]/5 rounded-full blur-[128px] pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-bold text-center mb-12"
                >
                    Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f6ff] to-[#a100ff]">Questions</span>
                </motion.h2>
                <div className="space-y-4">
                    {faqs.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`rounded-xl overflow-hidden transition-all duration-300 ${openFaq === idx ? 'bg-white/10 border-[#00f6ff]/50 shadow-[0_0_20px_rgba(0,246,255,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                            style={{ border: '1px solid', borderColor: openFaq === idx ? 'rgba(0,246,255,0.3)' : 'rgba(255,255,255,0.1)' }}
                        >
                            <button
                                onClick={() => toggleFaq(idx)}
                                className="w-full px-6 py-5 text-left flex justify-between items-center group"
                            >
                                <span className={`font-medium text-lg transition-colors ${openFaq === idx ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                    {item.q}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openFaq === idx ? 'bg-[#00f6ff] rotate-45' : 'bg-white/10 group-hover:bg-white/20'}`}>
                                    <span className={`text-xl font-light ${openFaq === idx ? 'text-[#020617]' : 'text-white'}`}>+</span>
                                </div>
                            </button>
                            <AnimatePresence>
                                {openFaq === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="px-6 pb-6 text-gray-400 leading-relaxed"
                                    >
                                        {item.a}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
