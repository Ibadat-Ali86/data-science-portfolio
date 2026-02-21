/**
 * Utility functions for consistent number formatting across the application.
 */

/**
 * Format a number as a percentage with 1 decimal place.
 * Handles null/undefined values gracefully.
 * @param {number} value - The value to format (e.g., 0.14 for 14%)
 * @param {boolean} isDecimal - If true, value is 0.14. If false, value is 14. Default false.
 * @returns {string} Formatted string (e.g., "14.0%")
 */
export const formatPercent = (value, isDecimal = false) => {
    if (value === null || value === undefined) return '—';
    const num = parseFloat(value);
    if (isNaN(num)) return '—';

    // If input is like 0.14 (isDecimal=true), multiply by 100.
    // If input is like 14 (isDecimal=false), use as is.
    const percentage = isDecimal ? num * 100 : num;
    return `${percentage.toFixed(1)}%`;
};

/**
 * Format a number as currency (USD).
 * @param {number} value - The value to format
 * @param {number} maxFractionDigits - Maximum fraction digits (default 0)
 * @returns {string} Formatted string (e.g., "$1,234")
 */
export const formatCurrency = (value, maxFractionDigits = 0) => {
    if (value === null || value === undefined) return '—';
    const num = parseFloat(value);
    if (isNaN(num)) return '—';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: maxFractionDigits
    }).format(num);
};

/**
 * Format a large number with commas.
 * @param {number} value - The value to format
 * @returns {string} Formatted string (e.g., "1,234")
 */
export const formatNumber = (value) => {
    if (value === null || value === undefined) return '—';
    const num = parseFloat(value);
    if (isNaN(num)) return '—';

    return new Intl.NumberFormat('en-US').format(num);
};
