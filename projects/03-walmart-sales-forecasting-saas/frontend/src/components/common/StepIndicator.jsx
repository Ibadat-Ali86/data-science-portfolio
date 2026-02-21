import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const StepIndicator = ({ currentStep, steps }) => {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-center max-w-3xl mx-auto px-4">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > index + 1;
                    const isCurrent = currentStep === index + 1;
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={index} className="flex items-center w-full max-w-xs last:w-auto">
                            <div className="relative flex flex-col items-center">
                                <motion.div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all duration-300 z-10 ${isCompleted
                                            ? 'bg-brand-600 border-white text-white shadow-md'
                                            : isCurrent
                                                ? 'bg-white border-brand-600 text-brand-600 shadow-lg shadow-brand-500/20'
                                                : 'bg-white border-slate-200 text-slate-400'
                                        }`}
                                    initial={false}
                                    animate={{
                                        scale: isCurrent ? 1.15 : 1,
                                        borderColor: isCurrent ? 'var(--brand-primary)' : isCompleted ? '#ffffff' : 'var(--border-default)'
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    {isCompleted ? (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <Check className="w-5 h-5 text-white" />
                                        </motion.div>
                                    ) : (
                                        index + 1
                                    )}
                                </motion.div>

                                <span
                                    className={`absolute top-14 text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${isCurrent
                                            ? 'text-brand-700 font-bold'
                                            : isCompleted
                                                ? 'text-slate-700'
                                                : 'text-slate-400'
                                        }`}
                                >
                                    {step}
                                </span>
                            </div>

                            {!isLast && (
                                <div className="flex-1 h-1 mx-4 bg-slate-200 relative w-full min-w-[3rem] rounded-full overflow-hidden">
                                    <motion.div
                                        className="absolute inset-y-0 left-0 bg-brand-600"
                                        initial={{ width: '0%' }}
                                        animate={{ width: isCompleted ? '100%' : '0%' }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepIndicator;
