
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Minus } from 'lucide-react';

const Checkbox = ({
    checked,
    indeterminate = false,
    onChange,
    disabled = false,
    label,
    className = ''
}) => {
    return (
        <label className={`inline-flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            <div
                className={`
                    relative flex items-center justify-center w-5 h-5 rounded border-2 transition-colors duration-200
                    ${checked || indeterminate
                        ? 'bg-brand-500 border-brand-500 text-white'
                        : 'bg-white border-border-default hover:border-brand-400'
                    }
                `}
                onClick={(e) => {
                    e.preventDefault();
                    if (!disabled) onChange(!checked);
                }}
            >
                <AnimatePresence>
                    {(checked || indeterminate) && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.1 }}
                        >
                            {indeterminate ? (
                                <Minus size={14} strokeWidth={3} />
                            ) : (
                                <Check size={14} strokeWidth={3} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {label && (
                <span className="text-sm text-text-primary select-none">{label}</span>
            )}
        </label>
    );
};

export default Checkbox;
