/**
 * Framer Motion Animation Variants Library
 * Reusable animation configurations for consistent motion design
 */

// Fade animations
export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

export const fadeInDown = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
};

// Scale animations
export const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
};

export const scaleUp = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    },
    exit: { opacity: 0, scale: 0.8 }
};

// Slide animations
export const slideIn = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 }
};

export const slideInRight = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 }
};

export const slideInLeft = {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
};

// Stagger container for list animations
export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

export const staggerContainerFast = {
    animate: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

// Item variants for stagger children
export const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

// Page transition
export const pageTransition = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.98,
        transition: {
            duration: 0.3
        }
    }
};

// Modal animations
export const modalBackdrop = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

export const modalContent = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: {
            duration: 0.2
        }
    }
};

// Tooltip
export const tooltip = {
    initial: { opacity: 0, scale: 0.9, y: 5 },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.15
        }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        y: 5,
        transition: {
            duration: 0.1
        }
    }
};

// Notification/Toast
export const toast = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 500,
            damping: 40
        }
    },
    exit: {
        opacity: 0,
        x: 100,
        scale: 0.9,
        transition: {
            duration: 0.2
        }
    }
};

// Hover animations (use with whileHover)
export const hoverScale = {
    scale: 1.05,
    transition: { duration: 0.2 }
};

export const hoverLift = {
    y: -4,
    transition: { duration: 0.2 }
};

// Tap animations (use with whileTap)
export const tapScale = {
    scale: 0.95
};
