/**
 * AI 전문가 패널 컴포넌트
 */

import React from 'react';
import type { ExpertConsensus } from '~/types/portfolio.types';
import { EXPERT_DESCRIPTIONS } from '~/lib/portfolio/constants';

interface ExpertPanelProps {
  consensus: ExpertConsensus;
}

export function ExpertPanel({ consensus }: ExpertPanelProps) {
  return (
    <div>
      {/* 합의 점수 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '16px', marginBottom: '10px' }}>전문가 합의 점수</div>
        <div style={{ fontSize: '48px', fontWeight: 'bold' }}>{consensus.consensusScore.toFixed(1)} / 10</div>
        {consensus.biasGuardTriggered && (
          <div style={{ marginTop: '10px', fontSize: '14px', opacity: 0.9 }}>
            ⚠️ BiasGuard 활성화: 다양한 관점 검토 완료
          </div>
        )}
      </div>

      {/* 상위 3개 합의 이유 */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>✅ 핵심 합의 이유 (Top 3)</h3>
        <ol style={{ paddingLeft: '20px', margin: 0 }}>
          {consensus.topReasons.map((reason, idx) => (
            <li key={idx} style={{ marginBottom: '10px', fontSize: '15px', lineHeight: '1.6' }}>
              {reason}
            </li>
          ))}
        </ol>
      </div>

      {/* 반대 의견 */}
      {consensus.dissentingOpinion && (
        <div
          style={{
            background: '#fff3e0',
            border: '2px solid #ff9800',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '30px',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#e65100' }}>
            ⚠️ 반대 의견
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>{consensus.dissentingOpinion}</div>
        </div>
      )}

      {/* 전문가별 분석 */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>👥 전문가별 상세 분석</h3>
        <div style={{ display: 'grid', gap: '20px' }}>
          {consensus.analyses.map((analysis) => (
            <div
              key={analysis.expertType}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '16px',
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {getExpertIcon(analysis.expertType)} {EXPERT_DESCRIPTIONS[analysis.expertType].role}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{analysis.perspective}</div>
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: getScoreColor(analysis.score),
                  }}
                >
                  {analysis.score.toFixed(1)}
                </div>
              </div>

              {/* 핵심 포인트 */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>핵심 평가:</div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {analysis.keyPoints.map((point, idx) => (
                    <li key={idx} style={{ fontSize: '13px', marginBottom: '4px', color: '#555' }}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 우려사항 */}
              {analysis.concerns && analysis.concerns.length > 0 && (
                <div
                  style={{
                    background: '#fff3e0',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#f57c00' }}>우려사항:</div>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {analysis.concerns.map((concern, idx) => (
                      <li key={idx} style={{ marginBottom: '2px', color: '#666' }}>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getExpertIcon(expertType: string): string {
  const icons: Record<string, string> = {
    economist: '📊',
    tech_specialist: '🧬',
    futurist: '🧭',
    investment_strategist: '💼',
    blockchain_specialist: '🪙',
    data_analyst: '🧠',
    behavioral_economist: '👩‍🏫',
    political_economist: '🏛️',
  };
  return icons[expertType] || '👤';
}

function getScoreColor(score: number): string {
  if (score >= 8) {
    return '#4CAF50';
  }

  if (score >= 6) {
    return '#2196F3';
  }

  if (score >= 4) {
    return '#FF9800';
  }

  return '#F44336';
}
