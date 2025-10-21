/**
 * 포트폴리오 차트 컴포넌트
 * Chart.js 기반 인터랙티브 차트
 */

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import type { PortfolioAllocation, CompoundCalculation, ScenarioSimulation } from '~/types/portfolio.types';
import { CHART_COLORS } from '~/lib/portfolio/constants';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface PieChartProps {
  allocations: PortfolioAllocation[];
}

export function AllocationPieChart({ allocations }: PieChartProps) {
  const data = {
    labels: allocations.map((a) => a.ticker),
    datasets: [
      {
        label: '비중 (%)',
        data: allocations.map((a) => a.allocation),
        backgroundColor: CHART_COLORS.PALETTE,
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: { size: 12 },
          padding: 15,
        },
      },
      title: {
        display: true,
        text: '포트폴리오 자산 배분',
        font: { size: 18, weight: 'bold' as const },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;

            return `${label}: ${value.toFixed(2)}%`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Pie data={data} options={options} />
    </div>
  );
}

interface BarChartProps {
  allocations: PortfolioAllocation[];
}

export function CagrBarChart({ allocations }: BarChartProps) {
  const data = {
    labels: allocations.map((a) => a.ticker),
    datasets: [
      {
        label: 'CAGR (%)',
        data: allocations.map((a) => a.cagr),
        backgroundColor: CHART_COLORS.PRIMARY,
        borderColor: CHART_COLORS.PRIMARY,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '종목별 예상 CAGR',
        font: { size: 18, weight: 'bold' as const },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `CAGR: ${context.parsed.y.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'CAGR (%)',
        },
      },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

interface GrowthCurveProps {
  compoundCalculation: CompoundCalculation;
}

export function CompoundGrowthCurve({ compoundCalculation }: GrowthCurveProps) {
  const data = {
    labels: compoundCalculation.yearlyBreakdown.map((y) => `${y.year}년차`),
    datasets: [
      {
        label: '투자원금',
        data: compoundCalculation.yearlyBreakdown.map((y) => y.invested),
        borderColor: CHART_COLORS.INFO,
        backgroundColor: 'rgba(0, 188, 212, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: '평가금액',
        data: compoundCalculation.yearlyBreakdown.map((y) => y.value),
        borderColor: CHART_COLORS.SUCCESS,
        backgroundColor: 'rgba(139, 195, 74, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '연도별 복리 성장 곡선',
        font: { size: 18, weight: 'bold' as const },
        padding: 20,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;

            return `${label}: ${(value / 1_000_000).toFixed(1)}백만원`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '금액 (원)',
        },
        ticks: {
          callback: (value: any) => `${(value / 1_000_000).toFixed(0)}M`,
        },
      },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

interface ScenarioChartProps {
  scenarios: ScenarioSimulation[];
}

export function ScenarioBarChart({ scenarios }: ScenarioChartProps) {
  const data = {
    labels: scenarios.map((s) => s.scenario),
    datasets: [
      {
        label: '예상 수익 (백만원)',
        data: scenarios.map((s) => s.expectedReturn / 1_000_000),
        backgroundColor: [CHART_COLORS.SUCCESS, CHART_COLORS.PRIMARY, CHART_COLORS.WARNING],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '시장 시나리오별 예상 수익',
        font: { size: 18, weight: 'bold' as const },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const scenario = scenarios[context.dataIndex];
            return [
              `예상 수익: ${(scenario.expectedReturn / 1_000_000).toFixed(1)}M원`,
              `CAGR: ${scenario.cagr.toFixed(1)}%`,
              `확률: ${scenario.probability}%`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '수익 (백만원)',
        },
      },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

interface GaugeChartProps {
  current: number;
  target: number;
}

export function GoalGaugeChart({ current, target }: GaugeChartProps) {
  const percentage = Math.min(100, (current / target) * 100);

  const data = {
    labels: ['달성률', '잔여'],
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [
          percentage >= 80 ? CHART_COLORS.SUCCESS : percentage >= 50 ? CHART_COLORS.PRIMARY : CHART_COLORS.WARNING,
          '#e0e0e0',
        ],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `목표 달성률: ${percentage.toFixed(1)}%`,
        font: { size: 18, weight: 'bold' as const },
        padding: 20,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%', position: 'relative' }}>
      <Pie data={data} options={options} />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        {(current / 100_000_000).toFixed(1)}억 / {(target / 100_000_000).toFixed(1)}억
      </div>
    </div>
  );
}

interface ProgressBarProps {
  current: number;
  target: number;
}

export function ProgressBar({ current, target }: ProgressBarProps) {
  const percentage = Math.min(100, (current / target) * 100);

  return (
    <div className="progress-bar-container" style={{ marginTop: '20px' }}>
      <div className="label" style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
        🏆 목표 달성률: {percentage.toFixed(1)}%
      </div>
      <div
        className="progress-bar"
        style={{
          width: '100%',
          height: '30px',
          background: '#eee',
          borderRadius: '15px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="progress"
          style={{
            height: '30px',
            width: `${percentage}%`,
            background:
              percentage >= 80 ? CHART_COLORS.SUCCESS : percentage >= 50 ? CHART_COLORS.PRIMARY : CHART_COLORS.WARNING,
            transition: 'width 0.5s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          {percentage.toFixed(1)}%
        </div>
      </div>
      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        현재 예상: {(current / 100_000_000).toFixed(1)}억원 / 목표: {(target / 100_000_000).toFixed(1)}억원
      </div>
    </div>
  );
}
