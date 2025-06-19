import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/components/Tooltip.css';

const AuroraTooltip = ({ children, content, disabled = false }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [placement, setPlacement] = useState('top');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const tooltipRef = useRef(null);
    const targetRef = useRef(null);
    const timeoutRef = useRef(null);

    const checkIfTruncated = () => {
        if (!targetRef.current) return false;
        const element = targetRef.current.querySelector('.truncated') || targetRef.current;
        return element.scrollWidth > element.clientWidth;
    };

    const calculatePosition = () => {
        if (!tooltipRef.current) return;

        // Use requestAnimationFrame to ensure tooltip dimensions are available
        requestAnimationFrame(() => {
            if (!tooltipRef.current) return;
            
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const padding = 8;
            const cursorOffset = 2; // Distance from cursor (2px as requested)

            // Use the stored mouse position
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            
            // Debug logging
            console.log('Mouse position:', mousePos);
            console.log('Tooltip dimensions:', tooltipRect.width, 'x', tooltipRect.height);
            
            let newPlacement = 'top';
            let top = mousePos.y - tooltipRect.height - cursorOffset;
            let left = mousePos.x - tooltipRect.width / 2;

            // If tooltip would go above viewport, place it below cursor
            if (top < padding) {
                newPlacement = 'bottom';
                top = mousePos.y + cursorOffset;
            }

            // Adjust horizontal position if tooltip would go off screen
            if (left < padding) {
                left = padding;
            } else if (left + tooltipRect.width > viewportWidth - padding) {
                left = viewportWidth - tooltipRect.width - padding;
            }

            console.log('Calculated position:', { top, left });
            
            setPlacement(newPlacement);
            setPosition({ top, left });
        });
    };

    const handleMouseEnter = (e) => {
        if (disabled || !content) return;
        
        // Use clientX/Y for viewport-relative positioning
        const x = e.clientX;
        const y = e.clientY;
        setMousePos({ x, y });
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, 300); // Reduced delay for better UX
    };

    const handleMouseMove = (e) => {
        // Update position on every mouse move
        const x = e.clientX;
        const y = e.clientY;
        setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 200); // Small delay before hiding
    };

    useEffect(() => {
        if (isVisible) {
            calculatePosition();
        }
    }, [isVisible, mousePos]);

    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <>
            <div 
                className="aurora-tooltip-wrapper"
                ref={targetRef}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>
            {isVisible && content && ReactDOM.createPortal(
                <div 
                    ref={tooltipRef}
                    className={`aurora-tooltip aurora-tooltip-${placement}`}
                    style={{
                        position: 'fixed',
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        transform: 'none', // Override any inherited transforms
                        pointerEvents: 'none' // Prevent tooltip from interfering with mouse events
                    }}
                >
                    <div className="aurora-tooltip-content">
                        {content}
                    </div>
                    <div className="aurora-tooltip-arrow" />
                </div>,
                document.body
            )}
        </>
    );
};

export default AuroraTooltip;