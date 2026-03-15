import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e) => {
            // Check if we are hovering over something interactive (link, button, etc.)
            const target = e.target;
            if (
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('interactive-hover')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[9999]"
                style={{
                    backgroundColor: 'transparent',
                    border: '1.5px solid rgba(255, 255, 255, 0.8)',
                }}
                animate={{
                    x: mousePosition.x - 20,
                    y: mousePosition.y - 20,
                    scale: isHovering ? 1.5 : 1,
                    opacity: isHovering ? 0 : 1,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                    mass: 0.2,
                }}
            />
            <div
                className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[10000]"
                style={{
                    transform: `translate(${mousePosition.x - 4}px, ${mousePosition.y - 4}px)`,
                }}
            />
        </>
    );
}
