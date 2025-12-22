import React from 'react';
import { motion } from 'framer-motion';

const Testimonials = () => {
    const testimonials = [
        { name: "Sarah Jenkins", role: "Product Manager", text: "TaskMaster completely transformed how our team ships products. The futuristic UI makes work feel like play." },
        { name: "David Chen", role: "Freelance Developer", text: "The Focus Mode is a game changer. I've doubled my coding output since switching to TaskMaster." },
    ];

    return (
        <section id="testimonials" className="py-24 px-6 bg-[#041022]">
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-bold text-center mb-16"
                >
                    User <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f6ff] to-[#a100ff]">Stories</span>
                </motion.h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {testimonials.map((user, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            whileHover={{ scale: 1.02 }}
                            className="p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-md hover:border-[#00f6ff]/30 transition-all"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xl font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{user.name}</div>
                                    <div className="text-sm text-[#00f6ff]">{user.role}</div>
                                </div>
                            </div>
                            <p className="text-gray-300 italic">"{user.text}"</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
