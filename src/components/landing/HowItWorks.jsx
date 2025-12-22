import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
    const steps = [
        { step: "01", title: "Create", desc: "Capture ideas and tasks instantly with voice or text." },
        { step: "02", title: "Organize", desc: "Categorize with AI tags and smart priorities." },
        { step: "03", title: "Focus", desc: "Execute with distraction-free timers and ambient sounds." },
    ];

    return (
        <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617] to-[#07102a] opacity-50" />
            <div className="max-w-7xl mx-auto relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-bold text-center mb-16"
                >
                    Workflow <span className="text-[#a100ff]">Evolved</span>
                </motion.h2>

                <div className="grid md:grid-cols-3 gap-12">
                    {steps.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="relative text-center group"
                        >
                            <div className="text-8xl font-black text-white/5 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 group-hover:text-white/10 transition-colors duration-500">
                                {item.step}
                            </div>
                            <div className="relative z-10 pt-12">
                                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#00f6ff] to-[#a100ff] flex items-center justify-center text-2xl font-bold mb-6 shadow-[0_0_20px_rgba(0,246,255,0.4)] group-hover:scale-110 transition-transform duration-300">
                                    {idx + 1}
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                                <p className="text-gray-400">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
