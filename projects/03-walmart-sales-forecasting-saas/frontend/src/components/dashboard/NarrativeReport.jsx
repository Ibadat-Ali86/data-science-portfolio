import React from 'react';
import { FileText, Lightbulb, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const NarrativeReport = ({ report }) => {
    if (!report) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    {report.title}
                </h2>
            </div>

            <div className="p-6 space-y-8">
                {report.sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            {section.heading === "Strategic Recommendations" && <Target className="w-5 h-5 text-emerald-500" />}
                            {section.heading === "Key Observations" && <Lightbulb className="w-5 h-5 text-amber-500" />}
                            {section.heading}
                        </h3>

                        {section.type === 'text' && (
                            <p className="text-slate-600 leading-relaxed text-base">
                                {section.content}
                            </p>
                        )}

                        {section.type === 'list' && (
                            <ul className="space-y-2">
                                {section.content.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-600">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default NarrativeReport;
