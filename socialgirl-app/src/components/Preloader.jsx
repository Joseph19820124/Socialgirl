import React, { useEffect, useState } from 'react';
import '../styles/components/Preloader.css';

const Preloader = ({ onLoadComplete }) => {
    const [percentage, setPercentage] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setPercentage(prev => {
                // Random increment between 5-20%
                const increment = Math.floor(Math.random() * 15) + 5;
                const newPercentage = prev + increment;
                
                if (newPercentage >= 100) {
                    clearInterval(interval);
                    // Start fade out after reaching 100%
                    setTimeout(() => {
                        setFadeOut(true);
                        // Notify parent after fade animation
                        setTimeout(() => {
                            onLoadComplete && onLoadComplete();
                        }, 1000);
                    }, 500);
                    return 100;
                }
                
                return newPercentage;
            });
        }, 200);

        // Alternative: Use actual window load event
        const handleLoad = () => {
            setPercentage(100);
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    onLoadComplete && onLoadComplete();
                }, 1000);
            }, 500);
        };

        // Check if already loaded
        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
        }

        return () => {
            clearInterval(interval);
            window.removeEventListener('load', handleLoad);
        };
    }, [onLoadComplete]);

    return (
        <div className={`preloader ${fadeOut ? 'fade-out' : ''}`} id="preloader">
            {/* Aurora background effects */}
            <div className="preloader-aurora"></div>
            <div className="preloader-aurora"></div>
            <div className="preloader-aurora"></div>
            
            {/* Preloader content */}
            <div className="preloader-content">
                {/* Liquid Morph Animation */}
                <div className="liquid-morph">
                    <div className="liquid-shape"></div>
                </div>
                
                <div className="loading-text">SOCIALGIRL</div>
                <div className="loading-percentage" id="percentage">{percentage}%</div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default Preloader;