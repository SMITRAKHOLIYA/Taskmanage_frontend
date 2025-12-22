import React, { useState } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';
import VideoModal from '../components/landing/VideoModal';
import ChatWidget from '../components/landing/ChatWidget';

const TaskMasterLanding = () => {
    const [openVideo, setOpenVideo] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#07102a] to-[#041022] text-white font-sans overflow-x-hidden selection:bg-[#00f6ff] selection:text-[#020617]">
            <LandingNavbar />
            <Hero setOpenFaq={() => setOpenVideo(true)} />
            <Features />
            <HowItWorks />
            <Testimonials />
            <FAQ />
            <Footer />
            <VideoModal isOpen={openVideo} onClose={() => setOpenVideo(false)} />
            <ChatWidget />
        </div>
    );
};

export default TaskMasterLanding;
