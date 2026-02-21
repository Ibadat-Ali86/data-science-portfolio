import React from 'react';
import { FileText, Upload, CheckCircle, AlertTriangle, User } from 'lucide-react';
import Card from '../ui/Card';

const activityItems = [
    {
        id: 1,
        user: 'Sarah Wilson',
        action: 'uploaded new sales data',
        target: 'Walmart_Sales_Q3.csv',
        time: '2 hours ago',
        icon: Upload,
        iconColor: 'text-brand-600 bg-brand-50',
    },
    {
        id: 2,
        user: 'System',
        action: 'completed forecast generation',
        target: 'Q4 Demand Forecast',
        time: '5 hours ago',
        icon: CheckCircle,
        iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
        id: 3,
        user: 'Mike Chen',
        action: 'flagged an anomaly',
        target: 'Inventory Spike in Region East',
        time: '1 day ago',
        icon: AlertTriangle,
        iconColor: 'text-amber-600 bg-amber-50',
    },
    {
        id: 4,
        user: 'Sarah Wilson',
        action: 'generated a report',
        target: 'Monthly Executive Summary',
        time: '1 day ago',
        icon: FileText,
        iconColor: 'text-purple-600 bg-purple-50',
    },
];

const RecentActivity = () => {
    return (
        <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-primary">Recent Activity</h3>
                <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">View All</button>
            </div>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-2 bottom-6 w-0.5 bg-border-primary" />

                <div className="space-y-6">
                    {activityItems.map((item) => (
                        <div key={item.id} className="relative flex items-start gap-4 group">
                            {/* Icon/Avatar */}
                            <div className={`relative z-10 w-12 h-12 rounded-xl border-4 border-bg-secondary flex items-center justify-center flex-shrink-0 ${item.iconColor}`}>
                                <item.icon className="w-5 h-5" />
                            </div>

                            <div className="flex-1 pt-1.5 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                    <p className="text-sm text-text-primary font-medium truncate">
                                        <span className="font-bold">{item.user}</span> {item.action}{' '}
                                        <span className="font-bold text-brand-600">{item.target}</span>
                                    </p>
                                    <span className="text-xs text-text-tertiary whitespace-nowrap">{item.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default RecentActivity;
