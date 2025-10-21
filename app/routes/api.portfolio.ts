/**
 * 포트폴리오 생성 API
 * GET /api/portfolio - 포트폴리오 리포트 생성
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { generateFullReport, evaluateGoalFeasibility } from '~/lib/portfolio/optimizer';
import { DEFAULT_USER_CONTEXT } from '~/lib/portfolio/constants';
import type { ApiResponse, PortfolioReport } from '~/types/portfolio.types';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // 쿼리 파라미터에서 사용자 컨텍스트 추출 (옵션)
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';

    // 포트폴리오 리포트 생성
    const report = await generateFullReport(DEFAULT_USER_CONTEXT);

    // 목표 달성 가능성 평가
    const feasibility = evaluateGoalFeasibility(report);

    const response: ApiResponse<{
      report: PortfolioReport;
      feasibility: any;
    }> = {
      success: true,
      data: {
        report,
        feasibility,
      },
      timestamp: new Date().toISOString(),
    };

    return json(response, {
      headers: {
        'Cache-Control': forceRefresh ? 'no-cache' : 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Portfolio generation error:', error);

    const errorResponse: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    return json(errorResponse, { status: 500 });
  }
}
