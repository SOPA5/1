/**
 * 포트폴리오 계산 유틸리티
 * 복리 계산, CAGR, Sharpe Ratio, 시나리오 분석 등
 */

import type { CompoundCalculation, ScenarioSimulation, PortfolioSimulation } from '~/types/portfolio.types';
import { SCENARIO_WEIGHTS } from './constants';

/**
 * 복리 수익 계산
 * FV = PMT × [(1 + r)^n - 1] / r
 *
 * @param monthlyInvestment 월 투자금 (원)
 * @param cagr 연평균 성장률 (%)
 * @param investmentPeriod 투자 기간 (개월)
 */
export function calculateCompoundReturn(
  monthlyInvestment: number,
  cagr: number,
  investmentPeriod: number,
): CompoundCalculation {
  const monthlyRate = cagr / 100 / 12; // 월 수익률
  const totalMonths = investmentPeriod;

  // 적립식 복리 계산
  const futureValue =
    monthlyInvestment * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
  const totalInvested = monthlyInvestment * totalMonths;
  const totalReturn = futureValue - totalInvested;

  // 연도별 분석
  const yearlyBreakdown = [];
  const years = Math.ceil(totalMonths / 12);

  for (let year = 1; year <= years; year++) {
    const monthsElapsed = Math.min(year * 12, totalMonths);
    const invested = monthlyInvestment * monthsElapsed;
    const value =
      monthlyInvestment * ((Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate) * (1 + monthlyRate);
    const gain = value - invested;

    yearlyBreakdown.push({
      year,
      invested: Math.round(invested),
      value: Math.round(value),
      gain: Math.round(gain),
    });
  }

  return {
    monthlyInvestment,
    investmentPeriod: totalMonths,
    cagr,
    totalInvested: Math.round(totalInvested),
    finalValue: Math.round(futureValue),
    totalReturn: Math.round(totalReturn),
    yearlyBreakdown,
  };
}

/**
 * CAGR (연평균 성장률) 계산
 * CAGR = (FV / PV)^(1/n) - 1
 *
 * @param initialValue 초기 가치
 * @param finalValue 최종 가치
 * @param years 기간 (년)
 */
export function calculateCAGR(initialValue: number, finalValue: number, years: number): number {
  return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
}

/**
 * Sharpe Ratio 계산
 * Sharpe = (포트폴리오 수익률 - 무위험 수익률) / 표준편차
 *
 * @param returns 수익률 배열
 * @param riskFreeRate 무위험 수익률 (기본 3%)
 */
export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 3): number {
  if (returns.length === 0) {
    return 0;
  }

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return 0;
  }

  return (avgReturn - riskFreeRate) / stdDev;
}

/**
 * 최대 낙폭 (Max Drawdown) 계산
 *
 * @param values 가치 배열
 */
export function calculateMaxDrawdown(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  let maxDrawdown = 0;
  let peak = values[0];

  for (const value of values) {
    if (value > peak) {
      peak = value;
    }

    const drawdown = ((peak - value) / peak) * 100;

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

/**
 * 시나리오 시뮬레이션
 * Bull (+25%), Base (0%), Bear (-25%) 시나리오 분석
 *
 * @param baseCAGR 기본 CAGR (%)
 * @param baseReturn 기본 예상 수익 (원)
 */
export function simulateScenarios(baseCAGR: number, baseReturn: number): ScenarioSimulation[] {
  const scenarios: ScenarioSimulation[] = [
    {
      scenario: 'BULL',
      probability: SCENARIO_WEIGHTS.BULL * 100,
      expectedReturn: Math.round(baseReturn * 1.25),
      cagr: baseCAGR * 1.25,
      drawdown: 10, // 낮은 하락폭
    },
    {
      scenario: 'BASE',
      probability: SCENARIO_WEIGHTS.BASE * 100,
      expectedReturn: Math.round(baseReturn),
      cagr: baseCAGR,
      drawdown: 20, // 중간 하락폭
    },
    {
      scenario: 'BEAR',
      probability: SCENARIO_WEIGHTS.BEAR * 100,
      expectedReturn: Math.round(baseReturn * 0.75),
      cagr: baseCAGR * 0.75,
      drawdown: 35, // 높은 하락폭
    },
  ];

  return scenarios;
}

/**
 * 가중 평균 ROI 계산
 *
 * @param scenarios 시나리오 배열
 */
export function calculateWeightedROI(scenarios: ScenarioSimulation[]): number {
  return scenarios.reduce((sum, scenario) => {
    return sum + scenario.expectedReturn * (scenario.probability / 100);
  }, 0);
}

/**
 * 포트폴리오 시뮬레이션 실행
 *
 * @param baseCAGR 기본 CAGR
 * @param baseReturn 기본 예상 수익
 * @param volatility 변동성 (%)
 */
export function runPortfolioSimulation(
  baseCAGR: number,
  baseReturn: number,
  volatility: number = 15,
): PortfolioSimulation {
  const scenarios = simulateScenarios(baseCAGR, baseReturn);
  const weightedROI = calculateWeightedROI(scenarios);

  // 예시 수익률 데이터 (실제로는 과거 데이터 필요)
  const mockReturns = [baseCAGR, baseCAGR * 1.1, baseCAGR * 0.9, baseCAGR * 1.2, baseCAGR * 0.85];

  const sharpeRatio = calculateSharpeRatio(mockReturns);

  return {
    scenarios,
    weightedROI: Math.round(weightedROI),
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    volatility,
    policyRisk: 15, // 임의값, 실제로는 정치경제학자 분석 필요
  };
}

/**
 * 목표 달성 확률 계산
 *
 * @param currentProjection 현재 예상 수익
 * @param targetReturn 목표 수익
 */
export function calculateSuccessProbability(currentProjection: number, targetReturn: number): number {
  const ratio = currentProjection / targetReturn;

  if (ratio >= 1.2) {
    return 95;
  }

  if (ratio >= 1.1) {
    return 85;
  }

  if (ratio >= 1.0) {
    return 75;
  }

  if (ratio >= 0.9) {
    return 60;
  }

  if (ratio >= 0.8) {
    return 45;
  }

  if (ratio >= 0.7) {
    return 30;
  }

  return 15;
}

/**
 * 저평가 점수 계산
 * Score = (내재가치 / 현재가) × 10
 *
 * @param intrinsicValue 내재가치
 * @param currentPrice 현재가
 */
export function calculateUndervaluationScore(intrinsicValue: number, currentPrice: number): number {
  if (currentPrice === 0) {
    return 0;
  }

  return (intrinsicValue / currentPrice) * 10;
}

/**
 * 분산 점수 계산
 * 포트폴리오가 얼마나 잘 분산되었는지 평가
 *
 * @param allocations 자산별 비중 배열 (%)
 */
export function calculateDiversificationScore(allocations: number[]): number {
  if (allocations.length === 0) {
    return 0;
  }

  // Herfindahl-Hirschman Index (HHI) 계산
  const hhi = allocations.reduce((sum, allocation) => {
    return sum + Math.pow(allocation, 2);
  }, 0);

  /*
   * 점수 정규화 (0-100, 낮을수록 분산 잘 됨)
   * 완전 분산: HHI = 10000/n, 완전 집중: HHI = 10000
   */
  const maxHHI = 10000;
  const minHHI = 10000 / allocations.length;
  const score = ((maxHHI - hhi) / (maxHHI - minHHI)) * 100;

  return Math.max(0, Math.min(100, score));
}

/**
 * 리밸런싱 필요 여부 확인
 *
 * @param currentAllocations 현재 비중 (%)
 * @param targetAllocations 목표 비중 (%)
 * @param threshold 임계값 (기본 5%)
 */
export function needsRebalancing(
  currentAllocations: number[],
  targetAllocations: number[],
  threshold: number = 5,
): boolean {
  if (currentAllocations.length !== targetAllocations.length) {
    return true;
  }

  for (let i = 0; i < currentAllocations.length; i++) {
    const deviation = Math.abs(currentAllocations[i] - targetAllocations[i]);

    if (deviation > threshold) {
      return true;
    }
  }

  return false;
}

/**
 * 월별 투자 일정 생성
 *
 * @param startDate 시작일
 * @param months 기간 (개월)
 * @param monthlyAmount 월 투자금
 */
export function generateInvestmentSchedule(
  startDate: Date,
  months: number,
  monthlyAmount: number,
): Array<{ month: number; date: string; amount: number; cumulative: number }> {
  const schedule = [];
  let cumulative = 0;

  for (let i = 0; i < months; i++) {
    const investmentDate = new Date(startDate);
    investmentDate.setMonth(investmentDate.getMonth() + i);

    cumulative += monthlyAmount;

    schedule.push({
      month: i + 1,
      date: investmentDate.toISOString().split('T')[0],
      amount: monthlyAmount,
      cumulative,
    });
  }

  return schedule;
}
