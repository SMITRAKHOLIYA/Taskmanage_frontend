import React, { useState, useEffect } from 'react';

const FullscreenToggle = ({ className, children, onClick, ...props }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => {
                console.error(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const handleClick = (e) => {
        if (onClick) onClick(e);
        toggleFullscreen();
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <button
            onClick={handleClick}
            {...props}
            className={className || "p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors relative outline-none focus:ring-2 focus:ring-primary-500"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
            {isFullscreen ? (
                // Contract / Exit Icon
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.207l2.147-2.146M14 10h4.793l-2.147 2.146M14 14h4.793l-2.147-2.146M10 10H5.207l2.147 2.146" />
                    {/* A simplified contract icon */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9h4m0 0V5m0 4L4 4m11 5h-4m0 0V5m0 4l5-5M5 15h4m0 0v4m0-4l-5 5m15-5h-4m0 0v4m0-4l5 5" />
                </svg>
            ) : (
                // Expand Icon
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
            )}
            {children}
        </button>
    );
};

export default FullscreenToggle;
