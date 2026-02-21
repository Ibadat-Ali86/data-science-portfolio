import { useRef, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ForecastChart = ({ data }) => {
    const chartRef = useRef(null);
    const [gradientActual, setGradientActual] = useState(null);
    const [gradientForecast, setGradientForecast] = useState(null);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.ctx;

        // Create gradients
        const gradientA = ctx.createLinearGradient(0, 0, 0, 400);
        gradientA.addColorStop(0, 'rgba(74, 158, 255, 0.4)');
        gradientA.addColorStop(1, 'rgba(74, 158, 255, 0)');
        setGradientActual(gradientA);

        const gradientF = ctx.createLinearGradient(0, 0, 0, 400);
        gradientF.addColorStop(0, 'rgba(183, 148, 246, 0.4)');
        gradientF.addColorStop(1, 'rgba(183, 148, 246, 0)');
        setGradientForecast(gradientF);
    }, [data]);

    const chartData = {
        labels: data?.labels || [],
        datasets: [
            {
                label: 'Actual Consumptions',
                data: (data?.actual || []).map(v => v !== null && v !== undefined ? parseFloat(v) : null),
                borderColor: '#3B82F6', // viz-primary (Blue)
                backgroundColor: gradientActual || 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                spanGaps: true,
                pointRadius: 0, // Clean look, show on hover
                pointHitRadius: 20,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#3B82F6',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                order: 2,
            },
            {
                label: 'Upper Bound',
                data: (data?.forecast || []).map(v => v !== null && v !== undefined ? parseFloat(v) * 1.05 : null),
                borderColor: 'transparent',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                fill: '+1',
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 0,
                order: 3,
            },
            {
                label: 'AI Forecast',
                data: (data?.forecast || []).map(v => v !== null && v !== undefined ? parseFloat(v) : null),
                borderColor: '#6366F1', // primary-500 (Indigo)
                backgroundColor: gradientForecast || 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                borderDash: [6, 4],
                tension: 0.4,
                fill: false,
                spanGaps: true,
                pointRadius: 0,
                pointHitRadius: 20,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#6366F1',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                order: 1,
            },
            {
                label: 'Lower Bound',
                data: (data?.forecast || []).map(v => v !== null && v !== undefined ? parseFloat(v) * 0.95 : null),
                borderColor: 'transparent',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                fill: '-1',
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 0,
                order: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'start',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 20,
                    color: '#A3ADBF', // var(--text-secondary)
                    font: {
                        family: 'Inter',
                        size: 12,
                        weight: 500
                    }
                },
            },
            tooltip: {
                backgroundColor: 'rgba(19, 24, 41, 0.9)', // var(--bg-secondary)
                titleColor: '#E8EDF4', // var(--text-primary)
                bodyColor: '#A3ADBF', // var(--text-secondary)
                borderColor: 'rgba(74, 158, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                boxPadding: 4,
                titleFont: {
                    family: 'Inter',
                    size: 13,
                    weight: 600
                },
                bodyFont: {
                    family: 'JetBrains Mono',
                    size: 12
                },
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += '$' + context.parsed.y.toLocaleString();
                        }
                        return label;
                    }
                }
            },
            filler: {
                propagate: false,
            },
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(163, 173, 191, 0.1)', // var(--border-primary) with lower opacity
                    drawBorder: false,
                },
                ticks: {
                    color: '#6B7790', // var(--text-tertiary)
                    font: {
                        family: 'JetBrains Mono',
                        size: 10,
                    },
                    callback: function (value) {
                        if (value >= 1000) {
                            return '$' + value / 1000 + 'k';
                        }
                        return '$' + value;
                    },
                },
                border: {
                    display: false
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#6B7790', // var(--text-tertiary)
                    font: {
                        family: 'Inter',
                        size: 11,
                    },
                    maxRotation: 0,
                },
                border: {
                    display: false
                }
            },
        },
    };

    return (
        <div className="h-full w-full relative">
            {/* Grid background effect */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(74, 158, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74, 158, 255, 0.03) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    opacity: 0.5
                }}
            />
            <Line ref={chartRef} data={chartData} options={options} />
        </div>
    );
};

export default ForecastChart;
