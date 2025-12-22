import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
// The following imports are no longer needed for the new Hero component
// import { Suspense, useRef } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { OrbitControls, Float, RoundedBox, Text } from '@react-three/drei';
// import * as THREE from 'three';

// The following components are no longer needed for the new Hero component
// const TaskCard = ({ position, color, delay }) => {
//     return (
//         <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
//             <group position={position}>
//                 <RoundedBox args={[1.8, 0.6, 0.1]} radius={0.05} smoothness={4}>
//                     <meshStandardMaterial
//                         color={color}
//                         emissive={color}
//                         emissiveIntensity={0.2}
//                         roughness={0.2}
//                         metalness={0.8}
//                     />
//                 </RoundedBox>
//                 {/* Simulated text lines */}
//                 <mesh position={[-0.4, 0.1, 0.06]}>
//                     <planeGeometry args={[0.8, 0.05]} />
//                     <meshBasicMaterial color="white" transparent opacity={0.8} />
//                 </mesh>
//                 <mesh position={[-0.4, -0.1, 0.06]}>
//                     <planeGeometry args={[0.6, 0.05]} />
//                     <meshBasicMaterial color="white" transparent opacity={0.5} />
//                 </mesh>
//             </group>
//         </Float>
//     );
// };

// const Column = ({ position, title, color }) => {
//     return (
//         <group position={position}>
//             {/* Column Header */}
//             <Text
//                 position={[0, 1.8, 0]}
//                 fontSize={0.25}
//                 color={color}
//                 anchorX="center"
//                 anchorY="middle"
//                 font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
//             >
//                 {title}
//             </Text>

//             {/* Column Background (Simulated Glass) */}
//             <RoundedBox args={[2.2, 4, 0.1]} radius={0.1} smoothness={4} position={[0, -0.2, -0.1]}>
//                 <meshStandardMaterial
//                     color={color}
//                     opacity={0.1}
//                     transparent
//                     roughness={0.1}
//                     metalness={0.8}
//                 />
//             </RoundedBox>
//         </group>
//     );
// };

// const TaskBoard3D = () => {
//     const groupRef = useRef();

//     useFrame((state) => {
//         const t = state.clock.getElapsedTime();
//         groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.1; // Gentle sway
//     });

//     return (
//         <group ref={groupRef} rotation={[0.1, -0.2, 0]}>
//             {/* Columns */}
//             <Column position={[-2.5, 0, 0]} title="TODO" color="#00f6ff" />
//             <Column position={[0, 0, 0]} title="IN PROGRESS" color="#a100ff" />
//             <Column position={[2.5, 0, 0]} title="DONE" color="#00ff9d" />

//             {/* Floating Tasks */}
//             {/* Todo Column */}
//             <TaskCard position={[-2.5, 1, 0.1]} color="#1e293b" />
//             <TaskCard position={[-2.5, 0.2, 0.1]} color="#1e293b" />
//             <TaskCard position={[-2.5, -0.6, 0.1]} color="#1e293b" />

//             {/* In Progress Column */}
//             <TaskCard position={[0, 0.8, 0.2]} color="#4c1d95" />
//             <TaskCard position={[0, -0.4, 0.2]} color="#4c1d95" />

//             {/* Done Column */}
//             <TaskCard position={[2.5, 0.5, 0.1]} color="#064e3b" />
//             <TaskCard position={[2.5, -0.3, 0.1]} color="#064e3b" />
//             <TaskCard position={[2.5, -1.1, 0.1]} color="#064e3b" />
//         </group>
//     );
// };

const HolographicDashboard = () => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    const handleMouseMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((event.clientX - centerX) / 5);
        y.set((event.clientY - centerY) / 5);
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
            className="relative w-full h-[500px] flex items-center justify-center perspective-1000"
        >
            {/* Main Dashboard Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative w-[90%] h-[80%] bg-[#020617]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,246,255,0.1)] overflow-hidden transform-style-3d group"
            >
                {/* Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

                {/* Header */}
                <div className="absolute top-0 left-0 w-full h-16 border-b border-white/10 flex items-center justify-between px-6">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="text-xs font-mono text-[#00f6ff] tracking-widest">SYSTEM_ONLINE</div>
                </div>

                {/* Content Layout */}
                <div className="absolute top-16 left-0 w-full h-[calc(100%-4rem)] p-6 grid grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="col-span-1 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-8 w-full bg-white/5 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>

                    {/* Main Area */}
                    <div className="col-span-2 flex flex-col gap-6">
                        {/* Graph Area */}
                        <div className="h-32 w-full bg-gradient-to-r from-[#00f6ff]/10 to-[#a100ff]/10 rounded-xl border border-white/5 relative overflow-hidden">
                            <svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none">
                                <motion.path
                                    d="M0,100 Q50,50 100,80 T200,40 T300,90 T400,20 V128 H0 Z"
                                    fill="url(#grad1)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                />
                                <defs>
                                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" style={{ stopColor: '#00f6ff', stopOpacity: 0.2 }} />
                                        <stop offset="100%" style={{ stopColor: '#a100ff', stopOpacity: 0.2 }} />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        {/* Task Cards */}
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            {['Deploy Update', 'Review Code', 'Team Sync'].map((task, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 + i * 0.2 }}
                                    className="bg-white/5 rounded-xl border border-white/5 p-4 flex items-center gap-3 hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-4 h-4 rounded-full border border-[#00f6ff]" />
                                    <div className="text-sm text-gray-300">{task}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Floating Widgets */}
            <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 top-20 bg-[#020617]/90 backdrop-blur-md border border-[#00f6ff]/30 p-4 rounded-xl shadow-[0_0_30px_rgba(0,246,255,0.2)] z-20"
            >
                <div className="text-xs text-[#00f6ff] font-bold mb-1">PERFORMANCE</div>
                <div className="text-2xl font-bold text-white">+124%</div>
            </motion.div>

            <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -left-4 bottom-20 bg-[#020617]/90 backdrop-blur-md border border-[#a100ff]/30 p-4 rounded-xl shadow-[0_0_30px_rgba(161,0,255,0.2)] z-20"
            >
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#a100ff] animate-ping" />
                    <div className="text-sm font-bold text-white">System Active</div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Hero = ({ setOpenFaq }) => {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#00f6ff]/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#a100ff]/20 rounded-full blur-[128px] pointer-events-none" />

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="text-left"
                >
                    <motion.div variants={fadeInUp} className="inline-block px-4 py-1.5 rounded-full border border-[#00f6ff]/30 bg-[#00f6ff]/10 text-[#00f6ff] text-xs font-bold tracking-wider mb-6 uppercase shadow-[0_0_10px_rgba(0,246,255,0.2)]">
                        The Future of Productivity
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
                        Manage tomorrow’s <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f6ff] to-[#a100ff]">
                            tasks today.
                        </span>
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
                        Experience a new era of task management. Seamlessly organize, collaborate, and achieve your goals with our AI-powered, futuristic platform.
                    </motion.p>
                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                        <Link to="/signup" className="px-8 py-4 rounded-xl bg-white text-[#020617] font-bold text-lg hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            Start for Free
                        </Link>
                        <button
                            onClick={() => setOpenFaq('demo')}
                            className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-white font-bold text-lg hover:bg-white/10 transition-all"
                        >
                            Watch Demo
                        </button>
                    </motion.div>

                    {/* Mini Stats */}
                    <motion.div variants={fadeInUp} className="mt-12 flex gap-8 border-t border-white/10 pt-8">
                        <div>
                            <div className="text-2xl font-bold text-white">10k+</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Teams</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#00f6ff]">35%</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Productivity Boost</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#a100ff]">1M+</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Tasks Done</div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Holographic Dashboard Element */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="w-full relative"
                >
                    <HolographicDashboard />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
