
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

const ChartWrapper = ({
    title,
    subtitle,
    children,
    isLoading = false,
    isEmpty = false,
    className = '',
    height = 'h-80',
    infoTooltip
}) => {
    return (
        <div className={`bg-bg-elevated border border-border-default rounded-xl p-6 shadow-sm flex flex-col ${className}`}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-text-primary font-display flex items-center gap-2">
                        {title}
                        {infoTooltip && (
                            <div className="group relative">
                                <Info size={16} className="text-text-tertiary cursor-help" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-popover-bg text-popover-text text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    {infoTooltip}
                                </div>
                            </div>
                        )}
                    </h3>
                    {subtitle && (
                        <p className="text-sm text-text-tertiary mt-1">{subtitle}</p>
                    )}
                </div>
            </div>

            <div className={`relative w-full ${height}`}>
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-elevated/50 backdrop-blur-[1px] z-10 rounded-lg">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-text-secondary font-medium">Loading data...</span>
                        </div>
                    </div>
                ) : isEmpty ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <div className="w-12 h-12 bg-bg-tertiary rounded-full flex items-center justify-center mb-3">
                            <Info className="text-text-tertiary" size={24} />
                        </div>
                        <p className="text-text-secondary font-medium">No data available</p>
                        <p className="text-sm text-text-tertiary">Try adjusting your filters</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full"
                    >
                        {children}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ChartWrapper;
