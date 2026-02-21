/**
 * Phase 5: Health Monitoring Utilities
 * Monitor app performance and API health for Hugging Face deployment
 */

export function initializeMonitoring() {
    // Performance monitoring
    if ('performance' in window && 'PerformanceObserver' in window) {
        // Monitor long tasks (>50ms)
        const longTaskObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 50) {
                    console.warn('[Performance] Long task detected:', entry.duration, 'ms');

                    // Send to analytics (if configured)
                    logMetric('long_task', {
                        duration: entry.duration,
                        name: entry.name
                    });
                }
            }
        });

        try {
            longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (e) {
            console.warn('[Monitoring] Long task observer not supported');
        }

        // Monitor largest contentful paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];

            console.log('[Performance] LCP:', lastEntry.renderTime || lastEntry.loadTime);

            logMetric('lcp', {
                value: lastEntry.renderTime || lastEntry.loadTime,
                url: window.location.pathname
            });
        });

        try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.warn('[Monitoring] LCP observer not supported');
        }

        // Monitor first input delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.log('[Performance] FID:', entry.processingStart - entry.startTime);

                logMetric('fid', {
                    value: entry.processingStart - entry.startTime,
                    name: entry.name
                });
            }
        });

        try {
            fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            console.warn('[Monitoring] FID observer not supported');
        }
    }

    // API health check
    startHealthCheck();

    // Memory monitoring (for debugging leaks)
    if ('memory' in performance) {
        setInterval(() => {
            const memory = performance.memory;
            console.log('[Memory] Used:', (memory.usedJSHeapSize / 1048576).toFixed(2), 'MB');

            if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
                console.warn('[Memory] High memory usage detected!');
            }
        }, 60000); // Check every minute
    }
}

async function startHealthCheck() {
    const checkHealth = async () => {
        try {
            const startTime = performance.now();
            const response = await fetch('/api/health', {
                method: 'GET',
                cache: 'no-cache'
            });
            const endTime = performance.now();
            const latency = endTime - startTime;

            if (response.ok) {
                console.log('[Health] API healthy, latency:', latency.toFixed(2), 'ms');

                logMetric('api_health', {
                    status: 'healthy',
                    latency: latency
                });

                // Warning if latency is high
                if (latency > 2000) {
                    console.warn('[Health] High API latency detected');
                }
            } else {
                console.error('[Health] API unhealthy, status:', response.status);

                logMetric('api_health', {
                    status: 'unhealthy',
                    code: response.status
                });
            }
        } catch (error) {
            console.error('[Health] Health check failed:', error);

            logMetric('api_health', {
                status: 'failed',
                error: error.message
            });
        }
    };

    // Initial check
    await checkHealth();

    // Periodic checks every 5 minutes
    setInterval(checkHealth, 300000);
}

function logMetric(metricName, data) {
    const metric = {
        name: metricName,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
        ...data
    };

    // Log to console in development
    if (import.meta.env.DEV) {
        console.log('[Metric]', metric);
    }

    // In production, send to analytics service
    // For Hugging Face, we can use localStorage for now
    try {
        const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
        metrics.push(metric);

        // Keep only last 100 metrics
        if (metrics.length > 100) {
            metrics.splice(0, metrics.length - 100);
        }

        localStorage.setItem('performance_metrics', JSON.stringify(metrics));
    } catch (e) {
        console.warn('[Metric] Failed to store metric:', e);
    }
}

export function getPerformanceMetrics() {
    try {
        return JSON.parse(localStorage.getItem('performance_metrics') || '[]');
    } catch {
        return [];
    }
}

export function clearPerformanceMetrics() {
    localStorage.removeItem('performance_metrics');
}

// Resource hints for critical resources
export function addResourceHints() {
    const head = document.head;

    // Preconnect to API
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    head.appendChild(preconnect);

    // DNS prefetch for external resources
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = 'https://fonts.googleapis.com';
    head.appendChild(dnsPrefetch);
}

// Memory pressure detection (experimental)
export function onMemoryPressure(callback) {
    if ('memory' in performance) {
        const checkMemory = () => {
            const memory = performance.memory;
            const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

            if (usageRatio > 0.85) {
                callback('critical', usageRatio);
            } else if (usageRatio > 0.7) {
                callback('moderate', usageRatio);
            }
        };

        setInterval(checkMemory, 30000); // Check every 30s
    }
}

// Error tracking
export function setupErrorTracking() {
    window.addEventListener('error', (event) => {
        console.error('[Error]', event.error);

        logMetric('javascript_error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('[Unhandled Promise]', event.reason);

        logMetric('promise_rejection', {
            reason: event.reason?.message || String(event.reason)
        });
    });
}
