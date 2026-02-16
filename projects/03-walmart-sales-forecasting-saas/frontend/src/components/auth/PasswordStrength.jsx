/**
 * PasswordStrength Component
 * 4-segment password strength meter with real-time validation
 */

import React from 'react';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';

const PasswordStrength = ({ password }) => {
    const { strength, text, color } = usePasswordStrength(password);

    const segments = [1, 2, 3, 4];

    return (
        <div className="mt-3 space-y-2">
            <div className="flex space-x-1">
                {segments.map((segment) => (
                    <div
                        key={segment}
                        className={`flex-1 h-1.5 rounded-full transition-all duration-400 ${segment <= strength ? color : 'bg-gray-200'
                            }`}
                    />
                ))}
            </div>
            <p className={`text-xs font-medium ${strength === 4 ? 'text-emerald-600' : 'text-gray-500'}`}>
                {text}
            </p>
        </div>
    );
};

export default PasswordStrength;
