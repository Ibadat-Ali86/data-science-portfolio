/**
 * usePasswordStrength Hook
 * Calculates password strength and returns appropriate feedback
 */

import { useMemo } from 'react';

export const usePasswordStrength = (password) => {
    const result = useMemo(() => {
        if (!password) {
            return {
                strength: 0,
                text: 'Enter at least 8 characters',
                color: 'bg-gray-200'
            };
        }

        let strength = 0;

        // Length check
        if (password.length >= 8) strength++;

        // Upper and lowercase
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;

        // Numbers
        if (password.match(/[0-9]/)) strength++;

        // Special characters
        if (password.match(/[^a-zA-Z0-9]/)) strength++;

        const strengthData = [
            { color: 'bg-gray-200', text: 'Enter at least 8 characters' },
            { color: 'bg-error-400', text: 'Weak - Add uppercase letters' },
            { color: 'bg-warning-400', text: 'Fair - Add numbers' },
            { color: 'bg-info-400', text: 'Good - Add special characters' },
            { color: 'bg-success-400', text: 'Strong password!' }
        ];

        return {
            strength,
            ...strengthData[strength]
        };
    }, [password]);

    return result;
};
