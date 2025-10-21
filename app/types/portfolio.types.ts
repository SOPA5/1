/**
 * 주식 포트폴리오 앱 타입 정의
 * Final Master Prompt v4.2 기반
 */

/*
 * ========================================
 * 사용자 컨텍스트
 * ========================================
 */
export interface UserContext {
  name: string;
  nationality: string;
  birthYear: number;
  occupation: string;
  investmentGoal: string;
  investmentStyle: string;
  monthlyInvestment: number; // 원
  totalInvestmentPeriod: number; // 개월
  targetReturn: number; // 원
  investmentMethod: string;
  language: string;
  autoUpdateSchedule: string;
  currentDate: string;
}

/*
 * ========================================
 * 전문가 시스템
 * ========================================
 */
export enum ExpertType {
  ECONOMIST = 'economist',
  TECH_SPECIALIST = 'tech_specialist',
  FUTURIST = 'futurist',
  INVESTMENT_STRATEGIST = 'investment_strategist',
  BLOCKCHAIN_SPECIALIST = 'blockchain_specialist',
  DATA_ANALYST = 'data_analyst',
  BEHAVIORAL_ECONOMIST = 'behavioral_economist',
  POLITICAL_ECONOMIST = 'political_economist',
}

export interface ExpertWeight {
  [ExpertType.ECONOMIST]: 1.15;
  [ExpertType.TECH_SPECIALIST]: 1.15;
  [ExpertType.DATA_ANALYST]: 1.15;
  [ExpertType.INVESTMENT_STRATEGIST]: 1.0;
  [ExpertType.BLOCKCHAIN_SPECIALIST]: 1.0;
  [ExpertType.FUTURIST]: 0.9;
  [ExpertType.BEHAVIORAL_ECONOMIST]: 0.9;
  [ExpertType.POLITICAL_ECONOMIST]: 0.9;
}

export interface ExpertAnalysis {
  expertType: ExpertType;
  perspective: string;
  keyPoints: string[];
  score: number; // 1-10
  reasoning: string;
  concerns?: string[];
}

export interface ExpertConsensus {
  analyses: ExpertAnalysis[];
  consensusScore: number;
  topReasons: string[];
  dissentingOpinion?: string;
  biasGuardTriggered: boolean;
}

/*
 * ========================================
 * 출처 검증 시스템 (SAVL)
 * ========================================
 */
export type SourceGrade = 'A+' | 'A' | 'B' | 'C';

export type MisinfoType = 'FALSE_LIKELY' | 'DISPUTED' | 'VERIFIED';

export interface Source {
  url: string;
  title: string;
  publisher: string;
  publishDate: string;
  grade: SourceGrade;
  trustScore: number; // 0-100
  baseScore: number;
  recency: number;
  corroboration: number;
  authorCredibility: number;
  transparency: number;
  correctionSpeed: number;
  conflictOfInterest: number;
  crossValidationCount: number;
  misinfoType: MisinfoType;
  adoptedInAnalysis: boolean;
  reasoning: string;
}

export interface SAVLValidation {
  watchlist: Source[]; // TrustScore >= 60
  verified: Source[]; // TrustScore >= 75 + crossValidation >= 2
  opportunityScore: number;
  noiseGatePenalty: number;
}

/*
 * ========================================
 * 자산 및 종목
 * ========================================
 */
export interface Asset {
  category: string;
  ticker: string;
  name: string;
  industry: string;
  keyGrowthPoints: string[];
  expectedCAGR: number; // %
  trustGrade: SourceGrade;
  sources: Source[];
  currentPrice?: number;
  buyPrice?: number;
  sellPrice?: number;
  holdingPeriod: number; // 년
  expectedReturn: number; // 원
}

export interface AssetCategory {
  name: string;
  growthScore: number; // 1-10
  innovationScore: number; // 1-10
  sustainabilityScore: number; // 1-10
  trustScore: number; // 1-10
  compoundPotential: number; // 1-10
  averageScore: number;
  consensusScore: number;
  cagr: number;
  sharpeRatio: number;
  maxDrawdown: number;
  selected: boolean;
}

/*
 * ========================================
 * 포트폴리오
 * ========================================
 */
export interface PortfolioAllocation {
  category: string;
  ticker: string;
  allocation: number; // %
  amount: number; // 원
  expectedReturn: number; // 원
  cagr: number; // %
}

export interface Portfolio {
  userId: string;
  createdAt: string;
  updatedAt: string;
  totalInvestment: number; // 원
  targetCAGR: number; // %
  targetReturn: number; // 원
  allocations: PortfolioAllocation[];
  expertConsensus: ExpertConsensus;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  strategyType: 'CONSERVATIVE' | 'AGGRESSIVE';
}

/*
 * ========================================
 * 시나리오 시뮬레이션
 * ========================================
 */
export interface ScenarioSimulation {
  scenario: 'BULL' | 'BASE' | 'BEAR';
  probability: number; // %
  expectedReturn: number; // 원
  cagr: number; // %
  drawdown: number; // %
}

export interface PortfolioSimulation {
  scenarios: ScenarioSimulation[];
  weightedROI: number;
  sharpeRatio: number;
  volatility: number;
  policyRisk: number;
}

/*
 * ========================================
 * 계산 및 분석
 * ========================================
 */
export interface CompoundCalculation {
  monthlyInvestment: number;
  investmentPeriod: number; // 개월
  cagr: number; // %
  totalInvested: number;
  finalValue: number;
  totalReturn: number;
  yearlyBreakdown: {
    year: number;
    invested: number;
    value: number;
    gain: number;
  }[];
}

export interface UndervaluationScore {
  intrinsicValue: number;
  currentMarketPrice: number;
  score: number; // (intrinsicValue / currentMarketPrice) * 10
}

/*
 * ========================================
 * 리포트
 * ========================================
 */
export interface ReportMetadata {
  reportDate: string;
  version: string;
  monthlyInvestment: number;
  fiveYearGoal: number;
  weeklyROIChange: number;
}

export interface PortfolioReport {
  metadata: ReportMetadata;
  userContext: UserContext;
  selectedCategories: AssetCategory[];
  topAssets: Asset[];
  portfolio: Portfolio;
  simulation: PortfolioSimulation;
  compoundCalculation: CompoundCalculation;
  expertConsensus: ExpertConsensus;
  sources: Source[];
  charts?: {
    pieChart?: any;
    barChart?: any;
    growthCurve?: any;
    heatmap?: any;
    gaugeChart?: any;
    compoundCurve?: any;
  };
}

/*
 * ========================================
 * API 응답
 * ========================================
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface AnalysisRequest {
  userContext: UserContext;
  forceRefresh?: boolean;
}

export interface ExportData {
  categories: string[];
  tickers: string[];
  cagr: number[];
  allocationPercent: number[];
  expectedReturn: number[];
  sourceUrls: string[][];
  trustScores: number[];
  reportDate: string;
}
