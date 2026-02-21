
import React from 'react';
// import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, X } from 'lucide-react';

function ReloadPrompt() {
    // const {
    //     offlineReady: [offlineReady, setOfflineReady],
    //     needRefresh: [needRefresh, setNeedRefresh],
    //     updateServiceWorker,
    // } = useRegisterSW({
    //     onRegistered(r) {
    //         console.log('SW Registered: ' + r);
    //     },
    //     onRegisterError(error) {
    //         console.log('SW registration error', error);
    //     },
    // });

    // const close = () => {
    //     setOfflineReady(false);
    //     setNeedRefresh(false);
    // };

    return null; // Temporarily disabled to fix build error
    /*
    return (
        <AnimatePresence>
            {(offlineReady || needRefresh) && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            {offlineReady ? <WifiOff className="w-6 h-6 text-green-400" /> : <RefreshCw className="w-6 h-6 text-blue-400" />}
                        </div>
                        <div className="flex-1 pt-0.5">
                            <h3 className="text-sm font-medium text-white">
                                {offlineReady ? 'App ready to work offline' : 'New content available'}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                                {offlineReady
                                    ? 'AdaptIQ has been cached and is ready to use without internet.'
                                    : 'Click reload to update to the latest version.'}
                            </p>
                            <div className="mt-3 flex gap-3">
                                {needRefresh && (
                                    <button
                                        onClick={() => updateServiceWorker(true)}
                                        className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                                    >
                                        Reload
                                    </button>
                                )}
                                <button
                                    onClick={close}
                                    className="flex-1 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                        <button onClick={close} className="text-slate-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
    */
}

export default ReloadPrompt;
