/**
 * 포트폴리오 최적화 엔진
 * 전문가 분석, SAVL 검증, 계산 등을 통합하여 최적의 포트폴리오 구성
 */

import type {
  UserContext,
  Portfolio,
  PortfolioAllocation,
  Asset,
  AssetCategory,
  PortfolioReport,
  Source,
} from '~/types/portfolio.types';
import { calculateCompoundReturn, runPortfolioSimulation } from './calculator';
import { runExpertPanel } from './experts';
import { performSAVLValidation, createSource } from './savl';
import { DEFAULT_USER_CONTEXT, INVESTMENT_GOALS, RISK_THRESHOLDS, REPORT_VERSION } from './constants';

/**
 * 모의 자산 카테고리 데이터 생성
 */
export function generateMockCategories(): AssetCategory[] {
  return [
    {
      name: 'AI & Machine Learning',
      growthScore: 9.5,
      innovationScore: 9.8,
      sustainabilityScore: 8.5,
      trustScore: 9.0,
      compoundPotential: 9.2,
      averageScore: 9.2,
      consensusScore: 9.1,
      cagr: 35,
      sharpeRatio: 1.2,
      maxDrawdown: 22,
      selected: true,
    },
    {
      name: '반도체 & 하드웨어',
      growthScore: 8.8,
      innovationScore: 9.0,
      sustainabilityScore: 7.5,
      trustScore: 8.8,
      compoundPotential: 8.7,
      averageScore: 8.6,
      consensusScore: 8.7,
      cagr: 32,
      sharpeRatio: 1.1,
      maxDrawdown: 23,
      selected: true,
    },
    {
      name: '재생에너지 & 기후테크',
      growthScore: 8.5,
      innovationScore: 8.8,
      sustainabilityScore: 9.8,
      trustScore: 8.2,
      compoundPotential: 8.6,
      averageScore: 8.8,
      consensusScore: 9.0,
      cagr: 28,
      sharpeRatio: 0.9,
      maxDrawdown: 20,
      selected: true,
    },
    {
      name: '블록체인 & 디지털자산',
      growthScore: 7.8,
      innovationScore: 9.2,
      sustainabilityScore: 6.5,
      trustScore: 7.0,
      compoundPotential: 7.8,
      averageScore: 7.7,
      consensusScore: 7.6,
      cagr: 40,
      sharpeRatio: 0.7,
      maxDrawdown: 45,
      selected: false, // 리스크 높아 제외
    },
  ];
}

/**
 * 모의 종목 데이터 생성
 */
export function generateMockAssets(category: string): Asset[] {
  const assetMap: Record<string, Asset[]> = {
    'AI & Machine Learning': [
      {
        category: 'AI & Machine Learning',
        ticker: 'NVDA',
        name: 'NVIDIA',
        industry: '반도체',
        keyGrowthPoints: ['GPU 시장 독점', 'AI 데이터센터 수요 폭발', 'Blackwell 아키텍처'],
        expectedCAGR: 28,
        trustGrade: 'A+',
        sources: [],
        currentPrice: 500,
        buyPrice: 480,
        sellPrice: 700,
        holdingPeriod: 5,
        expectedReturn: 0,
      },
      {
        category: 'AI & Machine Learning',
        ticker: 'PLTR',
        name: 'Palantir',
        industry: 'AI 데이터 분석',
        keyGrowthPoints: ['국방/정부 계약 확대', 'AIP 플랫폼 성장', '기업 AI 수요'],
        expectedCAGR: 33,
        trustGrade: 'A',
        sources: [],
        currentPrice: 25,
        buyPrice: 24,
        sellPrice: 45,
        holdingPeriod: 5,
        expectedReturn: 0,
      },
      {
        category: 'AI & Machine Learning',
        ticker: 'MSFT',
        name: 'Microsoft',
        industry: '클라우드 & AI',
        keyGrowthPoints: ['Azure AI 성장', 'OpenAI 파트너십', 'Copilot 생태계'],
        expectedCAGR: 25,
        trustGrade: 'A+',
        sources: [],
        currentPrice: 380,
        buyPrice: 375,
        sellPrice: 550,
        holdingPeriod: 5,
        expectedReturn: 0,
      },
    ],
    '반도체 & 하드웨어': [
      {
        category: '반도체 & 하드웨어',
        ticker: 'ASML',
        name: 'ASML Holding',
        industry: '반도체 장비',
        keyGrowthPoints: ['EUV 리소그래피 독점', '첨단 공정 필수', '중국 시장 회복'],
        expectedCAGR: 30,
        trustGrade: 'A',
        sources: [],
        currentPrice: 800,
        buyPrice: 790,
        sellPrice: 1200,
        holdingPeriod: 5,
        expectedReturn: 0,
      },
      {
        category: '반도체 & 하드웨어',
        ticker: 'AMD',
        name: 'AMD',
        industry: '반도체',
        keyGrowthPoints: ['AI GPU 경쟁력', '데이터센터 점유율 상승', 'Xilinx 시너지'],
        expectedCAGR: 32,
        trustGrade: 'A',
        sources: [],
        currentPrice: 140,
        buyPrice: 135,
        sellPrice: 250,
        holdingPeriod: 5,
        expectedReturn: 0,
      },
    ],
    '재생에너지 & 기후테크': [
      {
        category: '재생에너지 & 기후테크',
        ticker: 'ENPH',
        name: 'Enphase Energy',
        industry: '태양광',
        keyGrowthPoints: ['마이크로인버터 시장 1위', '가정용 저장장치', 'IRA 수혜'],
        expectedCAGR: 26,
        trustGrade: 'B',
        sources: [],
        currentPrice: 95,
        buyPrice: 90,
        sellPrice: 160,
        holdingPeriod: 5,
        expectedReturn: 0,
      },
      {
        category: '재생에너지 & 기후테크',
        ticker: 'TSLA',
        name: 'Tesla',
        industry: '전기차 & 에너지',
        keyGrowthPoints: ['EV 리더', '에너지 저장', 'FSD/로보택시'],
        expectedCAGR: 29,
        trustGrade: 'A',
        sources: [],
        currentPrice: 250,
        buyPrice: 245,
        sellPrice: 450,
        holdingPeriod: 5,
        expectedReturn: 0,
      },
    ],
  };

  return assetMap[category] || [];
}

/**
 * 카테고리 선정 (Step 2)
 * 평균점수 >= 7, 합의점수 >= 8, CAGR >= 30%
 */
export async function selectCategories(categories: AssetCategory[]): Promise<AssetCategory[]> {
  const selected = categories.filter((cat) => {
    return (
      cat.averageScore >= INVESTMENT_GOALS.MIN_AVERAGE_SCORE &&
      cat.consensusScore >= INVESTMENT_GOALS.MIN_CONSENSUS_SCORE &&
      cat.cagr >= INVESTMENT_GOALS.MIN_ACCEPTABLE_CAGR &&
      cat.maxDrawdown < RISK_THRESHOLDS.MAX_DRAWDOWN_WARNING
    );
  });

  // 최소 3개 카테고리 확보
  if (selected.length < RISK_THRESHOLDS.DIVERSIFICATION_MIN_CATEGORIES) {
    console.warn(
      `Only ${selected.length} categories selected, need at least ${RISK_THRESHOLDS.DIVERSIFICATION_MIN_CATEGORIES}`,
    );
  }

  return selected.slice(0, 5); // 최대 5개
}

/**
 * 카테고리별 Top 종목 선정 (Step 3-5)
 */
export async function selectTopAssets(category: AssetCategory, count: number = 3): Promise<Asset[]> {
  const allAssets = generateMockAssets(category.name);

  /*
   * 간단히 CAGR 기준으로 정렬 (성능 개선)
   * 실제 운영 환경에서는 runExpertPanel() 호출 고려
   */
  allAssets.sort((a, b) => b.expectedCAGR - a.expectedCAGR);

  // Top N 선정
  return allAssets.slice(0, count);
}

/**
 * 포트폴리오 비중 최적화 (Step 6)
 * 간단한 균등 배분 + CAGR 가중치
 */
export function optimizeAllocations(assets: Asset[], totalInvestment: number): PortfolioAllocation[] {
  const totalCAGR = assets.reduce((sum, asset) => sum + asset.expectedCAGR, 0);

  return assets.map((asset) => {
    // CAGR 기반 가중치
    const weight = asset.expectedCAGR / totalCAGR;
    const allocation = weight * 100;
    const amount = totalInvestment * weight;

    return {
      category: asset.category,
      ticker: asset.ticker,
      allocation: Math.round(allocation * 100) / 100,
      amount: Math.round(amount),
      expectedReturn: 0, // 나중에 계산
      cagr: asset.expectedCAGR,
    };
  });
}

/**
 * 완전한 포트폴리오 생성
 */
export async function generatePortfolio(userContext: UserContext = DEFAULT_USER_CONTEXT): Promise<Portfolio> {
  // Step 1: 카테고리 생성 및 선정
  const allCategories = generateMockCategories();
  const selectedCategories = await selectCategories(allCategories);

  // Step 2: 각 카테고리별 Top 종목 선정
  const allAssets: Asset[] = [];

  for (const category of selectedCategories) {
    const topAssets = await selectTopAssets(category, 2); // 카테고리당 2개
    allAssets.push(...topAssets);
  }

  // Step 3: 포트폴리오 최적화
  const allocations = optimizeAllocations(allAssets, userContext.monthlyInvestment);

  // Step 4: 평균 CAGR 계산
  const avgCAGR = allocations.reduce((sum, a) => sum + a.cagr * (a.allocation / 100), 0);

  // Step 5: 간소화된 전문가 합의 (성능 개선)
  const expertConsensus = await runExpertPanel(allAssets[0], '전체 포트폴리오 평가');

  // Step 6: 리스크 레벨 결정
  const riskLevel = avgCAGR >= 35 ? 'HIGH' : avgCAGR >= 25 ? 'MEDIUM' : 'LOW';
  const strategyType = avgCAGR >= 30 ? 'AGGRESSIVE' : 'CONSERVATIVE';

  return {
    userId: userContext.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalInvestment: userContext.monthlyInvestment,
    targetCAGR: avgCAGR,
    targetReturn: userContext.targetReturn,
    allocations,
    expertConsensus,
    riskLevel,
    strategyType,
  };
}

/**
 * 완전한 리포트 생성 (All Steps)
 */
export async function generateFullReport(userContext: UserContext = DEFAULT_USER_CONTEXT): Promise<PortfolioReport> {
  // 포트폴리오 생성
  const portfolio = await generatePortfolio(userContext);

  // 복리 계산
  const compoundCalculation = calculateCompoundReturn(
    userContext.monthlyInvestment,
    portfolio.targetCAGR,
    userContext.totalInvestmentPeriod,
  );

  // 시뮬레이션
  const simulation = runPortfolioSimulation(portfolio.targetCAGR, compoundCalculation.totalReturn);

  // 카테고리 정보
  const categories = generateMockCategories().filter((c) => c.selected);

  // 자산 정보
  const topAssets: Asset[] = [];

  for (const allocation of portfolio.allocations) {
    const asset = generateMockAssets(allocation.category).find((a) => a.ticker === allocation.ticker);

    if (asset) {
      topAssets.push(asset);
    }
  }

  // 출처 (모의 데이터)
  const sources: Source[] = [
    createSource(
      'https://bloomberg.com/nvidia-ai-growth',
      'NVIDIA AI Revenue Surges 200%',
      'Bloomberg',
      '2025-10-15',
      3,
      true,
      true,
      null,
      false,
    ),
    createSource(
      'https://reuters.com/semiconductor-outlook',
      'Semiconductor Industry Outlook 2025',
      'Reuters',
      '2025-10-10',
      2,
      true,
      true,
      null,
      false,
    ),
  ];

  const validation = performSAVLValidation(sources);

  return {
    metadata: {
      reportDate: userContext.currentDate,
      version: REPORT_VERSION,
      monthlyInvestment: userContext.monthlyInvestment,
      fiveYearGoal: userContext.targetReturn,
      weeklyROIChange: 0,
    },
    userContext,
    selectedCategories: categories,
    topAssets,
    portfolio,
    simulation,
    compoundCalculation,
    expertConsensus: portfolio.expertConsensus,
    sources: validation.verified,
    charts: {
      pieChart: null,
      barChart: null,
      growthCurve: null,
      heatmap: null,
      gaugeChart: null,
      compoundCurve: null,
    },
  };
}

/**
 * 목표 달성 가능성 평가
 */
export function evaluateGoalFeasibility(report: PortfolioReport): {
  achievable: boolean;
  confidence: number;
  recommendation: string;
} {
  const projected = report.compoundCalculation.finalValue;
  const target = report.userContext.targetReturn;
  const ratio = projected / target;

  if (ratio >= 1.0) {
    return {
      achievable: true,
      confidence: Math.min(95, 75 + (ratio - 1) * 50),
      recommendation: `목표 달성 가능! 현재 전략 유지하며 ${Math.round((ratio - 1) * 100)}% 초과 달성 예상`,
    };
  } else {
    return {
      achievable: false,
      confidence: Math.max(20, 75 - (1 - ratio) * 100),
      recommendation: `목표 ${Math.round((1 - ratio) * 100)}% 부족. 월 투자금 ${Math.round(report.userContext.monthlyInvestment * (1 / ratio - 1))}원 증액 또는 더 공격적 전략 권장`,
    };
  }
}
