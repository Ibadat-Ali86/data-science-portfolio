/**
 * PasswordStrength Component - Enterprise Edition
 * 5-bar password strength indicator with requirements checklist
 */

import React, { useMemo } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PasswordStrength = ({ password }) => {
    const requirements = useMemo(() => [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'One lowercase letter', met: /[a-z]/.test(password) },
        { label: 'One number', met: /[0-9]/.test(password) },
        { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
    ], [password]);

    const strength = requirements.filter(r => r.met).length;
    const colors = ['#EF4444', '#F97316', '#EAB308', '#3B82F6', '#10B981'];
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

    if (!password) return null;

    return (
        <motion.div
            className="mt-3 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
        >
            {/* Strength Bars */}
            <div className="space-y-2">
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <motion.div
                            key={level}
                            className="flex-1 h-1.5 rounded-full transition-all duration-300"
                            style={{
                                backgroundColor: strength >= level ? colors[strength - 1] : '#E5E7EB'
                            }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: level * 0.05 }}
                        />
                    ))}
                </div>
                <p
                    className="text-xs font-semibold transition-colors"
                    style={{ color: strength > 0 ? colors[strength - 1] : '#9CA3AF' }}
                >
                    {strength > 0 ? labels[strength - 1] : 'Enter password'}
                </p>
            </div>

            {/* Requirements Checklist */}
            <ul className="space-y-1.5">
                {requirements.map((req, idx) => (
                    <motion.li
                        key={idx}
                        className={`flex items-center gap-2 text-xs transition-colors ${req.met ? 'text-emerald-600' : 'text-gray-500'
                            }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        {req.met ? (
                            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                        ) : (
                            <Circle size={14} className="text-gray-300 flex-shrink-0" />
                        )}
                        <span className="font-medium">{req.label}</span>
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
};

export default PasswordStrength;
