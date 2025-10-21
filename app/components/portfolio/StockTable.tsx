/**
 * 종목 테이블 컴포넌트
 */

import React from 'react';
import type { Asset, PortfolioAllocation } from '~/types/portfolio.types';

interface StockTableProps {
  assets: Asset[];
  allocations: PortfolioAllocation[];
}

export function StockTable({ assets, allocations }: StockTableProps) {
  // 자산과 배분 정보 결합
  const combined = assets.map((asset) => {
    const allocation = allocations.find((a) => a.ticker === asset.ticker);
    return { ...asset, allocation };
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0', background: '#f9f9f9' }}>
            <th style={headerStyle}>카테고리</th>
            <th style={headerStyle}>종목명</th>
            <th style={headerStyle}>티커</th>
            <th style={headerStyle}>산업</th>
            <th style={headerStyle}>비중</th>
            <th style={headerStyle}>투자금액</th>
            <th style={headerStyle}>예상 CAGR</th>
            <th style={headerStyle}>보유기간</th>
            <th style={headerStyle}>신뢰등급</th>
          </tr>
        </thead>
        <tbody>
          {combined.map((item) => (
            <tr key={item.ticker} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={cellStyle}>
                <span style={categoryBadgeStyle}>{item.category}</span>
              </td>
              <td style={{ ...cellStyle, fontWeight: 'bold' }}>{item.name}</td>
              <td style={{ ...cellStyle, fontFamily: 'monospace', color: '#2196F3' }}>{item.ticker}</td>
              <td style={cellStyle}>{item.industry}</td>
              <td style={{ ...cellStyle, fontWeight: 'bold' }}>{item.allocation?.allocation.toFixed(2)}%</td>
              <td style={cellStyle}>{item.allocation ? (item.allocation.amount / 10000).toLocaleString() : '0'}만원</td>
              <td style={{ ...cellStyle, color: '#4CAF50', fontWeight: 'bold' }}>{item.expectedCAGR.toFixed(1)}%</td>
              <td style={cellStyle}>{item.holdingPeriod}년</td>
              <td style={cellStyle}>
                <span style={getGradeBadgeStyle(item.trustGrade)}>{item.trustGrade}</span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '2px solid #e0e0e0', background: '#f9f9f9', fontWeight: 'bold' }}>
            <td colSpan={4} style={{ ...cellStyle, textAlign: 'right' }}>
              합계
            </td>
            <td style={cellStyle}>{allocations.reduce((sum, a) => sum + a.allocation, 0).toFixed(2)}%</td>
            <td style={cellStyle}>
              {(allocations.reduce((sum, a) => sum + a.amount, 0) / 10000).toLocaleString()}만원
            </td>
            <td colSpan={3} style={cellStyle}></td>
          </tr>
        </tfoot>
      </table>

      {/* 주요 성장 포인트 */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>📌 주요 성장 포인트</h3>
        {combined.map((item) => (
          <div key={item.ticker} style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
              {item.name} ({item.ticker})
            </div>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              {item.keyGrowthPoints.map((point, idx) => (
                <li key={idx} style={{ marginBottom: '4px', color: '#666', fontSize: '14px' }}>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '14px 12px',
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#555',
};

const cellStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '14px',
  verticalAlign: 'middle',
};

const categoryBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: '12px',
  background: '#e3f2fd',
  color: '#1976d2',
  fontSize: '12px',
  fontWeight: 'bold',
};

function getGradeBadgeStyle(grade: string): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
  };

  switch (grade) {
    case 'A+':
      return { ...baseStyle, background: '#c8e6c9', color: '#2e7d32' };
    case 'A':
      return { ...baseStyle, background: '#bbdefb', color: '#1565c0' };
    case 'B':
      return { ...baseStyle, background: '#fff9c4', color: '#f57f17' };
    default:
      return { ...baseStyle, background: '#ffccbc', color: '#d84315' };
  }
}
