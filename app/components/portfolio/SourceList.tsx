/**
 * SAVL 출처 검증 리스트 컴포넌트
 */

import React from 'react';
import type { Source } from '~/types/portfolio.types';

interface SourceListProps {
  sources: Source[];
}

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>검증된 출처가 없습니다.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
        총 {sources.length}개의 검증된 출처 (TrustScore ≥ 75, 교차검증 ≥ 2)
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {sources.map((source, idx) => (
          <div
            key={idx}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '16px',
              background: '#fafafa',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>{source.title}</div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  {source.publisher} · {source.publishDate}
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    color: '#2196F3',
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                  }}
                >
                  {source.url}
                </a>
              </div>
              <div style={{ marginLeft: '20px', textAlign: 'right' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={getGradeBadgeStyle(source.grade)}>{source.grade}</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: getTrustScoreColor(source.trustScore) }}>
                  {source.trustScore}
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>TrustScore</div>
              </div>
            </div>

            {/* 상세 점수 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '10px',
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #e0e0e0',
              }}
            >
              <ScoreBadge label="최신성" value={source.recency} />
              <ScoreBadge label="교차검증" value={source.corroboration} />
              <ScoreBadge label="저자신뢰도" value={source.authorCredibility} />
              <ScoreBadge label="투명성" value={source.transparency} />
            </div>

            {/* 교차검증 개수 */}
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
              🔗 교차검증: {source.crossValidationCount}개 출처
              {source.misinfoType === 'VERIFIED' && (
                <span style={{ marginLeft: '10px', color: '#4CAF50', fontWeight: 'bold' }}>✓ 검증됨</span>
              )}
            </div>

            {/* 채택 여부 */}
            {source.adoptedInAnalysis && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '8px',
                  background: '#e8f5e9',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#2e7d32',
                  fontWeight: 'bold',
                }}
              >
                ✅ 분석에 채택됨
              </div>
            )}

            {/* 사유 */}
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
              {source.reasoning}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ScoreBadgeProps {
  label: string;
  value: number;
}

function ScoreBadge({ label, value }: ScoreBadgeProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>{label}</div>
      <div
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: value >= 80 ? '#4CAF50' : value >= 60 ? '#2196F3' : '#FF9800',
        }}
      >
        {value}
      </div>
    </div>
  );
}

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

function getTrustScoreColor(score: number): string {
  if (score >= 90) {
    return '#4CAF50';
  }

  if (score >= 75) {
    return '#2196F3';
  }

  if (score >= 60) {
    return '#FF9800';
  }

  return '#F44336';
}
