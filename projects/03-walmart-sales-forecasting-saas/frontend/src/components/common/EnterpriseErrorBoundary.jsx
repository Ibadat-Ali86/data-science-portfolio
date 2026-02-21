import React, { Component } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle, RefreshCw, Home, Bug,
    ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import Button from '../ui/Button';

class EnterpriseErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false,
            copied: false,
            errorId: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Generate unique error ID for support
        const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        this.setState({
            errorInfo,
            errorId
        });

        // Log to error tracking service
        this.logError(error, errorInfo, errorId);
    }

    logError = (error, errorInfo, errorId) => {
        const errorData = {
            errorId,
            error: error.toString(),
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: localStorage.getItem('userId') || 'anonymous'
        };

        // Send to logging service
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        fetch(`${API_BASE_URL}/api/log-error`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(errorData)
        }).catch(console.error);

        // Console log for development
        console.error('Enterprise Error Boundary caught:', errorData);
    };

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        this.props.onRetry?.();
    };

    handleReset = () => {
        window.location.href = '/';
    };

    copyErrorDetails = () => {
        const details = `
Error ID: ${this.state.errorId}
Error: ${this.state.error?.toString()}
Time: ${new Date().toISOString()}
URL: ${window.location.href}
    `.trim();

        navigator.clipboard.writeText(details);
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full bg-bg-secondary rounded-2xl border border-border-primary overflow-hidden shadow-lg"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-danger-500/20 to-danger-600/20 p-6 border-b border-border-primary">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-danger-100 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-danger-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-text-primary">
                                        Something went wrong
                                    </h2>
                                    <p className="text-text-secondary text-sm mt-1">
                                        Error ID: <span className="font-mono text-danger-600">{this.state.errorId}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-text-secondary mb-6">
                                We've encountered an unexpected error. Our team has been notified and is working on a fix.
                                You can try refreshing the page or contact support if the problem persists.
                            </p>

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                <Button
                                    onClick={this.handleRetry}
                                    variant="primary"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                                <Button
                                    onClick={this.handleReset}
                                    variant="outline"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Go to Dashboard
                                </Button>
                                <Button
                                    onClick={() => window.location.reload()}
                                    variant="outline"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reload Page
                                </Button>
                            </div>

                            {/* Technical details (collapsible) */}
                            <div className="border border-border-primary rounded-lg overflow-hidden">
                                <button
                                    onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                                    className="w-full flex items-center justify-between p-4 bg-bg-tertiary hover:bg-bg-secondary transition-colors"
                                >
                                    <div className="flex items-center gap-2 text-text-secondary">
                                        <Bug className="w-4 h-4" />
                                        <span className="text-sm">Technical Details</span>
                                    </div>
                                    {this.state.showDetails ? (
                                        <ChevronUp className="w-4 h-4 text-text-tertiary" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-text-tertiary" />
                                    )}
                                </button>

                                {this.state.showDetails && (
                                    <div className="p-4 bg-bg-primary border-t border-border-primary">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs text-text-tertiary">Error Stack</span>
                                            <button
                                                onClick={this.copyErrorDetails}
                                                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
                                            >
                                                {this.state.copied ? (
                                                    <><Check className="w-3 h-3" /> Copied</>
                                                ) : (
                                                    <><Copy className="w-3 h-3" /> Copy</>
                                                )}
                                            </button>
                                        </div>
                                        <pre className="text-xs text-text-secondary overflow-x-auto p-3 bg-bg-tertiary rounded-lg">
                                            {this.state.error?.stack || 'No stack trace available'}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-bg-tertiary border-t border-border-primary text-center">
                            <p className="text-xs text-text-tertiary">
                                Need help? Contact support with Error ID: <span className="font-mono text-text-secondary">{this.state.errorId}</span>
                            </p>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default EnterpriseErrorBoundary;
