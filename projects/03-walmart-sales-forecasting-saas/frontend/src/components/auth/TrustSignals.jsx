/**
 * TrustSignals Component
 * Displays security certifications and compliance badges on authentication pages
 */

import { CheckCircle2, Shield, Lock, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations/variants';

const TrustSignals = () => {
    const signals = [
        { icon: Shield, text: 'SOC 2 Type II Certified' },
        { icon: Lock, text: '256-bit Encryption' },
        { icon: CheckCircle2, text: 'GDPR Compliant' },
        { icon: Award, text: 'ISO 27001 Certified' }
    ];

    return (
        <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
        >
            {signals.map((signal, index) => {
                const Icon = signal.icon;
                return (
                    <motion.div
                        key={index}
                        variants={staggerItem}
                        className="flex items-center gap-3"
                    >
                        <div className="flex-shrink-0">
                            <Icon
                                size={16}
                                className="text-emerald-500"
                                strokeWidth={2.5}
                            />
                        </div>
                        <span className="text-sm text-white/80 font-medium">
                            {signal.text}
                        </span>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export default TrustSignals;
