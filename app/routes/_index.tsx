/**
 * 메인 포트폴리오 페이지
 */

import { json, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { Dashboard } from '~/components/portfolio/Dashboard';
import { generateFullReport, evaluateGoalFeasibility } from '~/lib/portfolio/optimizer';
import { DEFAULT_USER_CONTEXT } from '~/lib/portfolio/constants';

export const meta: MetaFunction = () => {
  return [
    { title: '주식 포트폴리오 앱 - AI 기반 장기 가치투자' },
    { name: 'description', content: 'AI 전문가 집단지성 기반 장기 가치투자 포트폴리오' },
  ];
};

export async function loader() {
  try {
    // 포트폴리오 리포트 생성 (간소화된 버전)
    const report = await generateFullReport(DEFAULT_USER_CONTEXT);

    // 목표 달성 가능성 평가
    const feasibility = evaluateGoalFeasibility(report);

    return json({
      report,
      feasibility,
      error: null,
    });
  } catch (error) {
    console.error('Portfolio generation error:', error);
    return json({
      report: null,
      feasibility: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default function Index() {
  const { report, feasibility, error } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#f5f5f5',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '500px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>포트폴리오 생성 오류</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#2196F3',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#f5f5f5',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>포트폴리오 생성 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '20px 0' }}>
      <Dashboard report={report} />

      {/* 목표 달성 가능성 배너 */}
      {feasibility && (
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 20px',
          }}
        >
          <div
            style={{
              background: feasibility.achievable
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
              {feasibility.achievable ? '✅ 목표 달성 가능' : '⚠️ 전략 조정 필요'}
            </div>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>달성 확률: {feasibility.confidence.toFixed(0)}%</div>
            <div style={{ fontSize: '14px', opacity: 0.95 }}>{feasibility.recommendation}</div>
          </div>
        </div>
      )}

      {/* JSON Export Button */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
          textAlign: 'center',
          marginBottom: '40px',
        }}
      >
        <button
          onClick={() => {
            const dataStr = JSON.stringify(report, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `portfolio-${report.metadata.reportDate}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          style={{
            background: '#4CAF50',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }}
        >
          📥 JSON 데이터 내보내기
        </button>
      </div>
    </div>
  );
}
