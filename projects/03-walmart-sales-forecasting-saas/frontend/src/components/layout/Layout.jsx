import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';


const Layout = ({ children, title }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">


            {/* Background Mesh Gradient - Keep as fallback or overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--accent-purple)] opacity-[0.03] blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--accent-blue)] opacity-[0.03] blur-[100px]" />
            </div>

            <Sidebar
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative z-10 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'
                    }`}
            >
                <Header title={title} />

                <main className="flex-1 p-6 lg:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
