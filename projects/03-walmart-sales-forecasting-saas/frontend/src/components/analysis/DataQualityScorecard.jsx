
import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    AlertTriangle,
    XCircle,
    Info,
    Activity,
    Database,
    Calendar,
    FileCheck
} from 'lucide-react';

const DataQualityScorecard = ({ scorecard }) => {
    if (!scorecard) return null;

    const { overall_score, grade, dimensions } = scorecard;

    const getGradeColor = (g) => {
        if (g === 'A') return 'text-green-500 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
        if (g === 'B') return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
        if (g === 'C') return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
        return 'text-red-500 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 70) return 'bg-blue-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const DimensionRow = ({ label, icon: Icon, data, delay }) => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="mb-4 last:mb-0"
        >
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <Icon className="w-4 h-4 text-text-secondary" />
                    {label}
                </div>
                <div className="text-sm font-bold text-text-primary">{data.score}/100</div>
            </div>

            <div className="h-2 w-full bg-bg-tertiary rounded-full overflow-hidden mb-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.score}%` }}
                    transition={{ duration: 1, delay: delay + 0.2 }}
                    className={`h-full rounded-full ${getScoreColor(data.score)}`}
                />
            </div>

            {data.details && data.details.length > 0 && (
                <div className="text-xs text-text-secondary pl-6 space-y-1">
                    {data.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                            {data.score >= 80 ? (
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                                <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            )}
                            <span>{detail}</span>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );

    return (
        <div className="bg-bg-secondary rounded-xl border border-border-primary overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border-primary">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                            <Activity className="w-5 h-5 text-accent-blue" />
                            Data Quality Scorecard
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                            Algorithmic assessment of data readiness for forecasting.
                        </p>
                    </div>

                    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 ${getGradeColor(grade)}`}>
                        <span className="text-2xl font-black font-display">{grade}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Grade</span>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-bg-primary/50">
                <DimensionRow
                    label="Completeness"
                    icon={Database}
                    data={dimensions.completeness}
                    delay={0.1}
                />
                <DimensionRow
                    label="Consistency"
                    icon={FileCheck}
                    data={dimensions.consistency}
                    delay={0.2}
                />
                <DimensionRow
                    label="Frequency"
                    icon={Calendar}
                    data={dimensions.frequency}
                    delay={0.3}
                />
                <DimensionRow
                    label="History Sufficiency"
                    icon={Activity}
                    data={dimensions.sufficiency}
                    delay={0.4}
                />
            </div>

            {overall_score < 60 && (
                <div className="p-4 bg-red-50/50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-900/30 flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-300">
                        This dataset has significant quality issues that may affect forecast accuracy.
                        We recommend addressing the highlighted issues above before proceeding.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DataQualityScorecard;
