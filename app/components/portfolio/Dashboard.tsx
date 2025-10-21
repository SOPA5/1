/**
 * 메인 포트폴리오 대시보드
 */

import React from 'react';
import type { PortfolioReport } from '~/types/portfolio.types';
import {
  AllocationPieChart,
  CagrBarChart,
  CompoundGrowthCurve,
  ScenarioBarChart,
  GoalGaugeChart,
  ProgressBar,
} from './Charts';
import { StockTable } from './StockTable';
import { ExpertPanel } from './ExpertPanel';
import { SourceList } from './SourceList';

interface DashboardProps {
  report: PortfolioReport;
}

export function Dashboard({ report }: DashboardProps) {
  const { metadata, userContext, portfolio, compoundCalculation, simulation } = report;

  return (
    <div className="dashboard" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
          💎 {userContext.name}님의 장기 가치투자 포트폴리오
        </h1>
        <p style={{ fontSize: '16px', color: '#666' }}>AI 전문가 집단지성 기반 분석 | 버전 {metadata.version}</p>
      </header>

      {/* Summary Cards */}
      <div
        className="summary-cards"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        <div className="card" style={cardStyle}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>📅 최신 분석일</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{metadata.reportDate}</div>
        </div>
        <div className="card" style={cardStyle}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>💰 월 투자금</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {(metadata.monthlyInvestment / 10000).toFixed(0)}만원
          </div>
        </div>
        <div className="card" style={cardStyle}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>🎯 5년 목표</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {(metadata.fiveYearGoal / 100000000).toFixed(1)}억원
          </div>
        </div>
        <div className="card" style={cardStyle}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>📈 목표 CAGR</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
            {portfolio.targetCAGR.toFixed(1)}%
          </div>
        </div>
        <div className="card" style={cardStyle}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>🏆 예상 수익</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
            {(compoundCalculation.finalValue / 100000000).toFixed(1)}억원
          </div>
        </div>
        <div className="card" style={cardStyle}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>⚡ Sharpe Ratio</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{simulation.sharpeRatio}</div>
        </div>
      </div>

      {/* 목표 달성률 */}
      <div className="card" style={{ ...cardStyle, marginBottom: '40px' }}>
        <ProgressBar current={compoundCalculation.finalValue} target={userContext.targetReturn} />
      </div>

      {/* 차트 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
        <div className="card" style={cardStyle}>
          <AllocationPieChart allocations={portfolio.allocations} />
        </div>
        <div className="card" style={cardStyle}>
          <CagrBarChart allocations={portfolio.allocations} />
        </div>
        <div className="card" style={{ ...cardStyle, gridColumn: '1 / -1' }}>
          <CompoundGrowthCurve compoundCalculation={compoundCalculation} />
        </div>
        <div className="card" style={cardStyle}>
          <ScenarioBarChart scenarios={simulation.scenarios} />
        </div>
        <div className="card" style={cardStyle}>
          <GoalGaugeChart current={compoundCalculation.finalValue} target={userContext.targetReturn} />
        </div>
      </div>

      {/* 종목 테이블 */}
      <div className="card" style={{ ...cardStyle, marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>📊 포트폴리오 상세</h2>
        <StockTable assets={report.topAssets} allocations={portfolio.allocations} />
      </div>

      {/* 전문가 합의 */}
      <div className="card" style={{ ...cardStyle, marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>🧠 AI 전문가 집단지성 분석</h2>
        <ExpertPanel consensus={portfolio.expertConsensus} />
      </div>

      {/* 출처 검증 */}
      <div className="card" style={{ ...cardStyle, marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>🔍 SAVL 출처 검증</h2>
        <SourceList sources={report.sources} />
      </div>

      {/* 연도별 상세 분석 */}
      <div className="card" style={{ ...cardStyle, marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>📈 연도별 복리 성장 상세</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
              <th style={tableHeaderStyle}>년차</th>
              <th style={tableHeaderStyle}>누적 투자금</th>
              <th style={tableHeaderStyle}>평가금액</th>
              <th style={tableHeaderStyle}>수익금</th>
              <th style={tableHeaderStyle}>수익률</th>
            </tr>
          </thead>
          <tbody>
            {compoundCalculation.yearlyBreakdown.map((year) => (
              <tr key={year.year} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={tableCellStyle}>{year.year}년차</td>
                <td style={tableCellStyle}>{(year.invested / 10000).toLocaleString()}만원</td>
                <td style={tableCellStyle}>{(year.value / 10000).toLocaleString()}만원</td>
                <td style={{ ...tableCellStyle, color: '#4CAF50', fontWeight: 'bold' }}>
                  {(year.gain / 10000).toLocaleString()}만원
                </td>
                <td style={tableCellStyle}>{((year.gain / year.invested) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 초보자용 요약 */}
      <div
        className="card"
        style={{
          ...cardStyle,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          marginBottom: '40px',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>💡 초보자를 위한 핵심 요약</h2>
        <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
          <p>
            매달 <strong>{(userContext.monthlyInvestment / 10000).toFixed(0)}만원</strong>씩 꾸준히{' '}
            <strong>5년간</strong> 투자하면,
          </p>
          <p>
            CAGR <strong>{portfolio.targetCAGR.toFixed(1)}%</strong> 기준으로 약{' '}
            <strong>{(compoundCalculation.finalValue / 100000000).toFixed(1)}억원</strong> 달성이 가능합니다.
          </p>
          <p style={{ marginTop: '15px' }}>
            핵심은 <strong>분산 + 장기복리 + 꾸준함</strong>이며,
          </p>
          <p>단기 시세 변동에 흔들리지 않는 것이 중요합니다.</p>
          <p style={{ marginTop: '15px', fontSize: '14px', opacity: 0.9 }}>
            본 포트폴리오는 데이터 신뢰성, 미래 성장성, 안정성을 모두 검증한 장기 가치 중심 설계입니다.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontSize: '14px' }}>
        <p>🤖 Generated with AI Expert System v{metadata.version}</p>
        <p>Last updated: {metadata.reportDate}</p>
      </footer>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const tableHeaderStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px',
  fontWeight: 'bold',
  fontSize: '14px',
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '14px',
};
