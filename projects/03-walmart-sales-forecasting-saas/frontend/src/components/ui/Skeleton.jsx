/**
 * Skeleton Loading Component - Enterprise Design System
 * Loading skeletons with shimmer animation
 */

import React from 'react';

const Skeleton = ({
    variant = 'text',
    width,
    height,
    className = '',
    count = 1
}) => {
    const baseStyles = 'bg-gray-200 rounded animate-pulse';

    const variants = {
        text: 'h-4',
        title: 'h-8',
        avatar: 'w-12 h-12 rounded-full',
        button: 'h-10 w-32',
        card: 'h-48 w-full'
    };

    const shimmerStyles = `
    relative overflow-hidden
    before:absolute before:inset-0
    before:-translate-x-full
    before:animate-[shimmer_2s_infinite]
    before:bg-gradient-to-r
    before:from-transparent before:via-white/60 before:to-transparent
  `;

    const skeletonClass = `
    ${baseStyles} 
    ${variants[variant]} 
    ${shimmerStyles}
    ${className}
  `;

    const style = {
        width: width || undefined,
        height: height || undefined
    };

    if (count > 1) {
        return (
            <div className="space-y-3">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className={skeletonClass} style={style} />
                ))}
            </div>
        );
    }

    return <div className={skeletonClass} style={style} />;
};

// Skeleton Card Component
export const SkeletonCard = () => (
    <div className="bg-surface-default border border-border-default rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-4">
            <Skeleton variant="avatar" />
            <div className="flex-1 space-y-2">
                <Skeleton width="60%" />
                <Skeleton width="40%" />
            </div>
        </div>
        <Skeleton count={3} />
    </div>
);

// Skeleton Table Component
export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
    <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <Skeleton key={colIndex} className="flex-1" />
                ))}
            </div>
        ))}
    </div>
);

export default Skeleton;
