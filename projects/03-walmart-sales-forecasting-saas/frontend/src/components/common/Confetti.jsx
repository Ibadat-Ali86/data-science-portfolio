import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const Confetti = ({ trigger, duration = 5000 }) => {
    const { width, height } = useWindowSize();
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (trigger) {
            setIsActive(true);
            const timer = setTimeout(() => {
                setIsActive(false);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [trigger, duration]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">
            <ReactConfetti
                width={width}
                height={height}
                numberOfPieces={200}
                gravity={0.2}
                colors={['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899']}
            />
        </div>
    );
};

export default Confetti;
