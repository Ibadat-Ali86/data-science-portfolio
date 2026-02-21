import React from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, Bell, Shield, Smartphone, Moon, Globe } from 'lucide-react';

const Settings = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Settings</h2>
                    <p className="text-text-secondary mt-1">Manage your application preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation (Mock) */}
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { icon: User, label: 'Profile' },
                        { icon: Bell, label: 'Notifications' },
                        { icon: Shield, label: 'Security', active: true },
                        { icon: Smartphone, label: 'Device Management' },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${item.active
                                    ? 'bg-brand-50 text-brand-700'
                                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <h3 className="text-lg font-bold text-text-primary mb-4 border-b border-border-default pb-4">
                            Appearance & Accessibility
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-bg-tertiary text-text-secondary">
                                        <Moon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">Dark Mode</p>
                                        <p className="text-sm text-text-tertiary">Toggle dark theme preference</p>
                                    </div>
                                </div>
                                <div className="h-6 w-11 rounded-full bg-bg-tertiary relative cursor-pointer">
                                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-bold text-text-primary mb-4 border-b border-border-default pb-4">
                            Localization
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-bg-tertiary text-text-secondary">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">Language</p>
                                        <p className="text-sm text-text-tertiary">Select your preferred language</p>
                                    </div>
                                </div>
                                <select className="bg-bg-tertiary border border-border-primary rounded-lg text-sm p-2 text-text-primary">
                                    <option>English (US)</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost">Cancel</Button>
                        <Button variant="primary">Save Changes</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
