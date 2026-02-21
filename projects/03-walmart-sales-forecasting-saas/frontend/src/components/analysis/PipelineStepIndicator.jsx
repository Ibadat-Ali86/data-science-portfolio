import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PipelineStepIndicator = ({ currentStep, steps }) => {
    return (
        <div className="w-full py-8">
            <div className="relative flex items-center justify-between max-w-4xl mx-auto px-4 md:px-12">
                {/* Connecting Line Background */}
                <div className="absolute left-4 right-4 md:left-12 md:right-12 top-1/2 h-1 bg-slate-200 -translate-y-1/2 rounded-full z-0" />

                {/* Animated Progress Line */}
                <motion.div
                    className="absolute left-4 md:left-12 top-1/2 h-1 bg-brand-600 -translate-y-1/2 rounded-full z-0"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(currentStep / (Math.max(1, steps.length - 1))) * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div key={step.id || index} className="relative z-10 flex flex-col items-center">
                            {/* Step Circle */}
                            <motion.div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${isCompleted
                                        ? 'bg-brand-600 border-white shadow-md'
                                        : isCurrent
                                            ? 'bg-white border-brand-600 shadow-lg shadow-brand-500/20'
                                            : 'bg-white border-slate-200'
                                    }`}
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.2 : 1,
                                    borderColor: isCurrent ? 'var(--brand-primary)' : isCompleted ? '#ffffff' : 'var(--border-default)'
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <Check className="w-5 h-5 text-white" />
                                    </motion.div>
                                ) : (
                                    <span className={`text-sm font-bold ${isCurrent ? 'text-brand-600' : 'text-slate-400'}`}>
                                        {index + 1}
                                    </span>
                                )}
                            </motion.div>

                            {/* Step Label */}
                            <div className="absolute top-14 w-32 text-center hidden md:block">
                                <span className={`text-sm tracking-wide transition-colors duration-300 ${isCurrent
                                        ? 'text-brand-700 font-bold'
                                        : isCompleted
                                            ? 'text-slate-700 font-medium'
                                            : 'text-slate-400 font-medium'
                                    }`}>
                                    {step.name || step}
                                </span>
                            </div>

                            {/* Pulse Effect for Current Step */}
                            {isCurrent && (
                                <motion.div
                                    className="absolute inset-0 top-0 left-1/2 -ml-5 w-10 h-10 rounded-full bg-brand-400 opacity-20 -z-10"
                                    animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PipelineStepIndicator;
