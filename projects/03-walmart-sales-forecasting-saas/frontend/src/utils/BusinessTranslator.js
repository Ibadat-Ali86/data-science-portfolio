/**
 * BusinessTranslator Utility
 * Translates technical ML metrics (MAPE, RMSE, variance) into
 * executive-friendly business language and actionable insights.
 */

export class BusinessTranslator {
    constructor(forecastData, metrics, baselineRevenue = 0, avgPrice = 25) {
        this.forecast = forecastData;
        this.metrics = metrics;
        this.baselineRevenue = baselineRevenue;
        this.avgPrice = avgPrice;
    }

    getAccuracyNarrative() {
        const mape = this.metrics?.mape || 5;
        let rating = 'Moderate';
        let narrative = 'Expect some variance in the forecast.';

        if (mape <= 3) {
            rating = 'Excellent';
            narrative = 'Forecast highly reliable. Safe to optimize inventory strictly.';
        } else if (mape <= 7) {
            rating = 'Good';
            narrative = 'Forecast is reliable for standard operational planning.';
        } else if (mape <= 15) {
            rating = 'Fair';
            narrative = 'Higher variance expected. Maintain safety stock buffers.';
        } else {
            rating = 'Poor';
            narrative = 'Limited reliability. Use directional trends only.';
        }

        return {
            title: `Accuracy: ${rating}`,
            description: narrative,
            percentage: Math.max(0, 100 - mape).toFixed(1) + '%',
            rating: rating
        };
    }

    getRevenueImpact() {
        if (!this.forecast?.predictions) return { total: 0, narrative: 'No revenue impact data available.' };

        const totalUnits = this.forecast.predictions.reduce((a, b) => a + b, 0);
        const projectedRev = totalUnits * this.avgPrice;

        let narrative = '';
        if (this.baselineRevenue > 0) {
            const diff = projectedRev - this.baselineRevenue;
            const percentChange = ((diff / this.baselineRevenue) * 100).toFixed(1);
            if (diff > 0) {
                narrative = `Projected growth of ${percentChange}% vs baseline, driving an additional $${Math.round(diff).toLocaleString()} in revenue.`;
            } else {
                narrative = `Projected decline of ${Math.abs(percentChange)}% vs baseline. Immediate intervention recommended.`;
            }
        } else {
            narrative = `Projected to drive $${Math.round(projectedRev).toLocaleString()} in total pipeline revenue over the forecast window.`;
        }

        return {
            projectedRevenue: projectedRev,
            formattedRevenue: `$${Math.round(projectedRev).toLocaleString()}`,
            narrative: narrative
        };
    }

    getRiskAssessment() {
        if (!this.forecast?.predictions || !this.forecast?.upper_bound || !this.forecast?.lower_bound) {
            return { level: 'Unknown', narrative: 'Insufficient data for risk assessment.' };
        }

        // Calculate average variance (uncertainty) across the forecast horizon
        let totalVariancePercent = 0;
        let count = 0;

        for (let i = 0; i < this.forecast.predictions.length; i++) {
            const pred = this.forecast.predictions[i];
            const upper = this.forecast.upper_bound[i];
            const lower = this.forecast.lower_bound[i];

            if (pred > 0) {
                const spread = upper - lower;
                totalVariancePercent += (spread / pred);
                count++;
            }
        }

        const avgVariance = count > 0 ? totalVariancePercent / count : 0;

        let level = 'Medium';
        let narrative = 'Moderate uncertainty in certain periods.';

        if (avgVariance < 0.15) {
            level = 'Low';
            narrative = 'Stable demand patterns limit stockout/overstock risk. Supply chain can operate lean.';
        } else if (avgVariance > 0.40) {
            level = 'High';
            narrative = 'High volatility detected. Prepare flexible supply chain responses and buffer stock.';
        }

        return {
            level,
            narrative,
            varianceMetric: (avgVariance * 100).toFixed(1) + '%'
        };
    }

    generateExecutiveSummary() {
        const accuracy = this.getAccuracyNarrative();
        const revenue = this.getRevenueImpact();
        const risk = this.getRiskAssessment();

        const summary = `Based on the latest machine learning analysis, the demand forecast shows a ${accuracy.rating.toLowerCase()} level of accuracy (${accuracy.percentage}). ` +
            `We anticipate ${revenue.narrative.toLowerCase()} ` +
            `The current risk profile is ${risk.level.toLowerCase()}, indicating that ${risk.narrative.toLowerCase()}`;

        return {
            headline: `Forecast indicates ${revenue.formattedRevenue} potential revenue with ${risk.level.toLowerCase()} risk.`,
            detailedSummary: summary,
            accuracy,
            revenue,
            risk
        };
    }
}

export const translateMetricsToBusiness = (forecastData, metrics, baselineRevenue = 0, avgPrice = 25) => {
    const translator = new BusinessTranslator(forecastData, metrics, baselineRevenue, avgPrice);
    return translator.generateExecutiveSummary();
};
