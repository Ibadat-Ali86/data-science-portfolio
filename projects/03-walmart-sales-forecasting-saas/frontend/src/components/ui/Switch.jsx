
import { motion } from 'framer-motion';

const Switch = ({ checked, onChange, disabled = false, size = 'md' }) => {
    const sizes = {
        sm: { width: 32, height: 18, thumb: 14, padding: 2 },
        md: { width: 44, height: 24, thumb: 20, padding: 2 },
        lg: { width: 56, height: 32, thumb: 28, padding: 2 }
    };

    const currentSize = sizes[size] || sizes.md;

    return (
        <div
            className={`
                relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${checked ? 'bg-brand-500' : 'bg-gray-200'}
            `}
            style={{ width: currentSize.width, height: currentSize.height }}
            onClick={() => !disabled && onChange(!checked)}
        >
            <motion.div
                className="bg-white rounded-full shadow-sm"
                style={{
                    width: currentSize.thumb,
                    height: currentSize.thumb,
                }}
                animate={{
                    x: checked
                        ? currentSize.width - currentSize.thumb - currentSize.padding
                        : currentSize.padding
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        </div>
    );
};

export default Switch;
