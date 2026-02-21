import React from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, Mail, MapPin, Briefcase, Camera } from 'lucide-react';

const Profile = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">User Profile</h2>
                    <p className="text-text-secondary mt-1">Manage your personal information.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <Card className="text-center p-8">
                        <div className="relative w-32 h-32 mx-auto mb-6 group cursor-pointer">
                            <img
                                src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff&size=128"
                                alt="Profile"
                                className="w-full h-full rounded-full ring-4 ring-brand-50"
                            />
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">Admin User</h3>
                        <p className="text-text-secondary mb-4">Lead Data Scientist</p>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                            ACTIVE
                        </div>
                    </Card>
                </div>

                {/* Details Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <h3 className="text-lg font-bold text-text-primary mb-6">Personal Details</h3>
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            defaultValue="Admin User"
                                            className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border-primary rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-text-primary"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="email"
                                            defaultValue="admin@adaptiq.ai"
                                            className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border-primary rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-text-primary"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Role</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            defaultValue="Administrator"
                                            readOnly
                                            className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-tertiary cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Location</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            defaultValue="San Francisco, CA"
                                            className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border-primary rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-text-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
                                <Button variant="primary">Update Profile</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
