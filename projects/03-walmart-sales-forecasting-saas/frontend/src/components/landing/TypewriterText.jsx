import { useState, useEffect } from 'react';

/**
 * TypewriterText - Animated typewriter effect for text
 * Creates a typing animation with customizable speed
 */
const TypewriterText = ({
    text,
    delay = 0,
    speed = 50,
    className = '',
    onComplete = () => { }
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Initial delay before starting
        const startTimer = setTimeout(() => {
            if (currentIndex < text.length) {
                const timer = setTimeout(() => {
                    setDisplayedText(prev => prev + text[currentIndex]);
                    setCurrentIndex(prev => prev + 1);
                }, speed);

                return () => clearTimeout(timer);
            } else if (currentIndex === text.length && displayedText) {
                onComplete();
            }
        }, delay);

        return () => clearTimeout(startTimer);
    }, [currentIndex, text, speed, delay, onComplete, displayedText]);

    return (
        <span className={className}>
            {displayedText}
            {currentIndex < text.length && (
                <span className="animate-pulse">|</span>
            )}
        </span>
    );
};

export default TypewriterText;
