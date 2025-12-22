import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const FeatureCard = ({ feature }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [30, -30]);
    const rotateY = useTransform(x, [-100, 100], [-30, 30]);

    const handleMouseMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{ rotateX, rotateY, perspective: 1000 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:border-[#a100ff]/50 transition-all group cursor-pointer relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00f6ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#a100ff] transition-colors relative z-10">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed relative z-10">{feature.desc}</p>
        </motion.div>
    );
};

const Features = () => {
    const features = [
        { title: "Smart Boards", desc: "Kanban, List, and Calendar views that adapt to your workflow.", icon: "📊" },
        { title: "Real-Time Sync", desc: "Collaborate with your team instantly, anywhere in the world.", icon: "⚡" },
        { title: "Daily Summaries", desc: "AI-generated briefings to start your day with clarity.", icon: "🌅" },
        { title: "Focus Mode", desc: "Block distractions and dive deep into your most important work.", icon: "🎯" },
    ];

    return (
        <section id="features" className="py-24 px-6 bg-[#020617] relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-4"
                    >
                        Supercharged <span className="text-[#00f6ff]">Features</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto"
                    >
                        Tools designed to keep you in flow state, forever.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <FeatureCard key={idx} feature={feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
