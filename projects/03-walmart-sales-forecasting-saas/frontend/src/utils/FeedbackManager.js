// Haptic and Visual Feedback Manager
class FeedbackManager {
    static provide(trigger, context = {}) {
        // Visual Feedback
        if (context.element) {
            this.visual(trigger, context);
        }

        // Haptic Feedback (mobile)
        if (navigator.vibrate && window.matchMedia('(pointer: coarse)').matches) {
            this.haptic(trigger);
        }
    }

    static visual(trigger, { element, intensity = 'normal' }) {
        if (!element) return;

        const animations = {
            hover: { scale: 1.02, y: -2, shadow: 'elevated' },
            click: { scale: 0.98, duration: 'fast' },
            success: { scale: 1.05, color: 'success', checkmark: true },
            error: { shake: true, color: 'danger' }
        };

        // Apply with reduced-motion respect
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            // Subtle opacity change only
            element.style.opacity = '0.8';
            setTimeout(() => { if (element) element.style.opacity = '1'; }, 150);
            return;
        }

        // Full animation
        const config = animations[trigger];
        if (config && config.scale !== undefined) {
            element.style.transform = `scale(${config.scale}) translateY(${config.y || 0}px)`;

            // Reset transform after click
            if (trigger === 'click') {
                setTimeout(() => {
                    if (element) element.style.transform = `scale(1) translateY(0px)`;
                }, 150);
            }
        }
    }

    static haptic(trigger) {
        const patterns = {
            hover: null, // No haptic on hover
            click: 50, // Short burst
            success: [50, 50, 50], // Double burst
            error: [100, 50, 100, 50, 100], // Long bursts
        };

        if (patterns[trigger]) {
            navigator.vibrate(patterns[trigger]);
        }
    }
}

export default FeedbackManager;
