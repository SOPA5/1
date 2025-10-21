/**
 * 포트폴리오 시스템 상수
 */

import { ExpertType } from '~/types/portfolio.types';

/*
 * ========================================
 * 사용자 기본값 (박수오님 프로필)
 * ========================================
 */
export const DEFAULT_USER_CONTEXT = {
  name: '박수오',
  nationality: '대한민국',
  birthYear: 1993,
  occupation: '마케터 (휴직 중, 2개월 내 복귀 예정)',
  investmentGoal: '장기 가치투자 (단타 지양, 복리 기반 미래자산 축적)',
  investmentStyle: '성장형 (중위험 중수익, 기술·혁신 중심)',
  monthlyInvestment: 3_000_000, // 300만원
  totalInvestmentPeriod: 60, // 5년 = 60개월
  targetReturn: 1_000_000_000, // 10억원
  investmentMethod: '적립식·분산·장기복리 중심',
  language: '한국어',
  autoUpdateSchedule: '매주 일요일 07:00 KST',
  currentDate: new Date().toISOString().split('T')[0],
};

/*
 * ========================================
 * 전문가 시스템
 * ========================================
 */
export const EXPERT_WEIGHTS: Record<ExpertType, number> = {
  [ExpertType.ECONOMIST]: 1.15,
  [ExpertType.TECH_SPECIALIST]: 1.15,
  [ExpertType.DATA_ANALYST]: 1.15,
  [ExpertType.INVESTMENT_STRATEGIST]: 1.0,
  [ExpertType.BLOCKCHAIN_SPECIALIST]: 1.0,
  [ExpertType.FUTURIST]: 0.9,
  [ExpertType.BEHAVIORAL_ECONOMIST]: 0.9,
  [ExpertType.POLITICAL_ECONOMIST]: 0.9,
};

export const EXPERT_DESCRIPTIONS: Record<ExpertType, { role: string; criteria: string[] }> = {
  [ExpertType.ECONOMIST]: {
    role: '거시경제·금리·경기순환',
    criteria: ['경기민감도', '인플레이션', '금리전망'],
  },
  [ExpertType.TECH_SPECIALIST]: {
    role: 'AI·양자컴퓨팅·반도체·재생에너지',
    criteria: ['기술력', '혁신성', '산업파급력'],
  },
  [ExpertType.FUTURIST]: {
    role: '사회·환경·정책 트렌드',
    criteria: ['지속가능성', 'ESG', '인구변화'],
  },
  [ExpertType.INVESTMENT_STRATEGIST]: {
    role: '포트폴리오 구조·리스크 관리',
    criteria: ['최적 비중', '분산효과'],
  },
  [ExpertType.BLOCKCHAIN_SPECIALIST]: {
    role: '디지털자산·감사·거버넌스',
    criteria: ['신뢰도', '유동성', '투명성'],
  },
  [ExpertType.DATA_ANALYST]: {
    role: '정량모델·시장예측',
    criteria: ['성장률', 'PER', 'Sharpe', '변동성'],
  },
  [ExpertType.BEHAVIORAL_ECONOMIST]: {
    role: '투자자 행동·심리관리',
    criteria: ['감정통제', '지속적 투자루틴'],
  },
  [ExpertType.POLITICAL_ECONOMIST]: {
    role: '정책·지정학·금리·무역',
    criteria: ['지정학', '통화', '정책 리스크'],
  },
};

/*
 * ========================================
 * 출처 신뢰도
 * ========================================
 */
export const TRUSTED_SOURCES = {
  TIER_1: ['Bloomberg', 'Reuters', 'Morningstar'],
  TIER_2: ['CNBC', 'CoinDesk', 'FnGuide', 'Financial Times'],
  TIER_3: ['Yahoo Finance', 'MarketWatch', 'Investing.com'],
};

export const TRUST_SCORE_WEIGHTS = {
  BASE_SCORE: 0.35,
  RECENCY: 0.15,
  CORROBORATION: 0.15,
  AUTHOR_CREDIBILITY: 0.15,
  TRANSPARENCY: 0.1,
  CORRECTION_SPEED: 0.05,
  CONFLICT_OF_INTEREST: -0.05,
};

export const SAVL_THRESHOLDS = {
  WATCHLIST_MIN: 60,
  VERIFIED_MIN: 75,
  CROSS_VALIDATION_MIN: 2,
  NOISE_GATE_THRESHOLD: 3,
};

/*
 * ========================================
 * 투자 목표
 * ========================================
 */
export const INVESTMENT_GOALS = {
  TARGET_CAGR: 30, // 30% 이상
  MIN_ACCEPTABLE_CAGR: 18, // 최소 18%
  MIN_CONSENSUS_SCORE: 8, // 합의점수 최소 8점
  MIN_AVERAGE_SCORE: 7, // 평균점수 최소 7점
  MAX_HOLDINGS: 10, // 최대 보유 종목 수
  BIAS_GUARD_THRESHOLD: 0.6, // 60% 이상 한 섹터 선택 시 경고
};

/*
 * ========================================
 * 리스크 관리
 * ========================================
 */
export const RISK_THRESHOLDS = {
  MAX_DRAWDOWN_WARNING: 25, // 25% 이상 하락 시 방어모드
  MIN_SHARPE_RATIO: 0.5,
  DIVERSIFICATION_MIN_CATEGORIES: 3,
  DIVERSIFICATION_MAX_PER_CATEGORY: 40, // 한 카테고리 최대 40%
};

/*
 * ========================================
 * 시나리오 가중치
 * ========================================
 */
export const SCENARIO_WEIGHTS = {
  BULL: 0.25,
  BASE: 0.5,
  BEAR: 0.25,
};

/*
 * ========================================
 * 자산 카테고리 (예시)
 * ========================================
 */
export const DEFAULT_ASSET_CATEGORIES = [
  'AI & Machine Learning',
  '반도체 & 하드웨어',
  '재생에너지 & 기후테크',
  '로보틱스 & 자동화',
  '블록체인 & 디지털자산',
  '바이오테크 & 헬스케어',
  '우주항공 & 모빌리티',
  '핀테크 & 디지털금융',
];

/*
 * ========================================
 * 업데이트 스케줄
 * ========================================
 */
export const UPDATE_SCHEDULE = {
  CRON: '0 7 * * 0', // 매주 일요일 07:00
  TIMEZONE: 'Asia/Seoul',
};

/*
 * ========================================
 * API 설정
 * ========================================
 */
export const API_CONFIG = {
  TIMEOUT: 30000, // 30초
  RETRY_COUNT: 3,
  CACHE_TTL: 3600, // 1시간
};

/*
 * ========================================
 * 차트 색상
 * ========================================
 */
export const CHART_COLORS = {
  PRIMARY: '#4CAF50',
  SECONDARY: '#2196F3',
  WARNING: '#FF9800',
  DANGER: '#F44336',
  SUCCESS: '#8BC34A',
  INFO: '#00BCD4',
  PALETTE: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'],
};

/*
 * ========================================
 * 보고서 버전
 * ========================================
 */
export const REPORT_VERSION = 'v4.2';

/*
 * ========================================
 * 데이터 소스 우선순위
 * ========================================
 */
export const DATA_SOURCE_PRIORITY = ['Bloomberg', 'Reuters', 'Morningstar', 'CNBC', 'CoinDesk', 'FnGuide'];
