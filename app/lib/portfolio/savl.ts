/**
 * SAVL (Smart Adaptive Verification Layer)
 * 출처 검증 및 신뢰도 평가 시스템
 */

import type { Source, SAVLValidation, SourceGrade, MisinfoType } from '~/types/portfolio.types';
import { TRUST_SCORE_WEIGHTS, SAVL_THRESHOLDS, TRUSTED_SOURCES } from './constants';

/**
 * TrustScore 계산
 * TrustScore = 0.35×BS + 0.15×Recency + 0.15×Corroboration +
 *              0.15×AuthorCred + 0.10×Transparency + 0.05×Correction - 0.05×COI
 */
export function calculateTrustScore(source: Partial<Source>): number {
  const {
    baseScore = 50,
    recency = 50,
    corroboration = 50,
    authorCredibility = 50,
    transparency = 50,
    correctionSpeed = 50,
    conflictOfInterest = 0,
  } = source;

  const score =
    TRUST_SCORE_WEIGHTS.BASE_SCORE * baseScore +
    TRUST_SCORE_WEIGHTS.RECENCY * recency +
    TRUST_SCORE_WEIGHTS.CORROBORATION * corroboration +
    TRUST_SCORE_WEIGHTS.AUTHOR_CREDIBILITY * authorCredibility +
    TRUST_SCORE_WEIGHTS.TRANSPARENCY * transparency +
    TRUST_SCORE_WEIGHTS.CORRECTION_SPEED * correctionSpeed +
    TRUST_SCORE_WEIGHTS.CONFLICT_OF_INTEREST * conflictOfInterest;

  return Math.max(0, Math.min(100, score));
}

/**
 * 출처 등급 결정
 */
export function determineSourceGrade(trustScore: number, publisher: string): SourceGrade {
  // Tier 1 출처는 자동으로 A+ 또는 A
  if (TRUSTED_SOURCES.TIER_1.includes(publisher)) {
    return trustScore >= 90 ? 'A+' : 'A';
  }

  // Tier 2 출처
  if (TRUSTED_SOURCES.TIER_2.includes(publisher)) {
    if (trustScore >= 85) {
      return 'A';
    }

    if (trustScore >= 75) {
      return 'B';
    }

    return 'C';
  }

  // 기타 출처
  if (trustScore >= 90) {
    return 'A+';
  }

  if (trustScore >= 80) {
    return 'A';
  }

  if (trustScore >= 70) {
    return 'B';
  }

  return 'C';
}

/**
 * 최신성 점수 계산
 * 최근 데이터일수록 높은 점수
 */
export function calculateRecencyScore(publishDate: string): number {
  const now = new Date();
  const pubDate = new Date(publishDate);
  const daysDiff = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 7) {
    return 100;
  } // 1주일 이내

  if (daysDiff <= 30) {
    return 90;
  } // 1개월 이내

  if (daysDiff <= 90) {
    return 75;
  } // 3개월 이내

  if (daysDiff <= 180) {
    return 60;
  } // 6개월 이내

  if (daysDiff <= 365) {
    return 40;
  } // 1년 이내

  return 20; // 1년 이상
}

/**
 * 교차검증 점수 계산
 * 여러 출처에서 동일한 정보를 보도했는지 확인
 */
export function calculateCorroborationScore(crossValidationCount: number): number {
  if (crossValidationCount >= 5) {
    return 100;
  }

  if (crossValidationCount >= 3) {
    return 85;
  }

  if (crossValidationCount >= 2) {
    return 70;
  }

  if (crossValidationCount >= 1) {
    return 50;
  }

  return 30;
}

/**
 * 저자 신뢰도 점수
 * (실제로는 외부 API나 데이터베이스 필요)
 */
export function calculateAuthorCredibilityScore(publisher: string): number {
  if (TRUSTED_SOURCES.TIER_1.includes(publisher)) {
    return 95;
  }

  if (TRUSTED_SOURCES.TIER_2.includes(publisher)) {
    return 80;
  }

  if (TRUSTED_SOURCES.TIER_3.includes(publisher)) {
    return 65;
  }

  return 50;
}

/**
 * 투명성 점수
 * 출처가 명확한지, 데이터 근거가 있는지 등
 */
export function calculateTransparencyScore(hasDataSource: boolean, hasCitation: boolean): number {
  let score = 50;

  if (hasDataSource) {
    score += 25;
  }

  if (hasCitation) {
    score += 25;
  }

  return score;
}

/**
 * 정정 속도 점수
 * 오보 발생 시 얼마나 빨리 정정했는지
 */
export function calculateCorrectionSpeedScore(correctionHours: number | null): number {
  if (correctionHours === null) {
    return 50;
  } // 정정 이력 없음 (중립)

  if (correctionHours <= 24) {
    return 85;
  } // 24시간 내 정정

  if (correctionHours <= 72) {
    return 35;
  } // 72시간 내 정정 (패널티)

  return 15; // 72시간 이상 (큰 패널티)
}

/**
 * 이해충돌 점수
 * 해당 출처가 보도 대상과 이해관계가 있는지
 */
export function calculateConflictOfInterestScore(hasConflict: boolean): number {
  return hasConflict ? -30 : 0;
}

/**
 * 오보 유형 판단
 */
export function determineMisinfoType(trustScore: number, crossValidationCount: number): MisinfoType {
  if (trustScore >= SAVL_THRESHOLDS.VERIFIED_MIN && crossValidationCount >= SAVL_THRESHOLDS.CROSS_VALIDATION_MIN) {
    return 'VERIFIED';
  }

  if (trustScore < 50) {
    return 'FALSE_LIKELY';
  }

  return 'DISPUTED';
}

/**
 * OpportunityScore 계산
 * (0.3×GrowthSignal + 0.4×TrustScore + 0.2×Recency + 0.1×VolatilityContext)
 */
export function calculateOpportunityScore(
  growthSignal: number,
  trustScore: number,
  recencyScore: number,
  volatilityContext: number,
): number {
  return 0.3 * growthSignal + 0.4 * trustScore + 0.2 * recencyScore + 0.1 * volatilityContext;
}

/**
 * NoiseGate 패널티 적용
 * 동일 루머가 3회 이상 출처 시 -30% 패널티
 */
export function applyNoiseGatePenalty(sources: Source[], contentHash: string): number {
  const duplicateCount = sources.filter((s) => {
    // 실제로는 content hashing 필요
    return s.title === contentHash;
  }).length;

  if (duplicateCount >= SAVL_THRESHOLDS.NOISE_GATE_THRESHOLD) {
    return -30;
  }

  return 0;
}

/**
 * SAVL 검증 수행
 * Layer 1: Rapid Screening (TrustScore >= 60)
 * Layer 2: Confirmed Validation (TrustScore >= 75 + crossValidation >= 2)
 */
export function performSAVLValidation(sources: Source[]): SAVLValidation {
  const watchlist: Source[] = [];
  const verified: Source[] = [];

  for (const source of sources) {
    // Layer 1: Watchlist
    if (source.trustScore >= SAVL_THRESHOLDS.WATCHLIST_MIN) {
      watchlist.push(source);
    }

    // Layer 2: Verified
    if (
      source.trustScore >= SAVL_THRESHOLDS.VERIFIED_MIN &&
      source.crossValidationCount >= SAVL_THRESHOLDS.CROSS_VALIDATION_MIN &&
      source.misinfoType === 'VERIFIED'
    ) {
      verified.push(source);
    }
  }

  // OpportunityScore 계산 (평균)
  const opportunityScore =
    verified.length > 0
      ? verified.reduce((sum, s) => sum + calculateOpportunityScore(70, s.trustScore, s.recency, 60), 0) /
        verified.length
      : 0;

  // NoiseGate 패널티 (예시)
  const noiseGatePenalty = 0; // 실제로는 content hashing 필요

  return {
    watchlist,
    verified,
    opportunityScore,
    noiseGatePenalty,
  };
}

/**
 * 소스 생성 헬퍼 함수
 * (실제로는 외부 API에서 데이터 수집)
 */
export function createSource(
  url: string,
  title: string,
  publisher: string,
  publishDate: string,
  crossValidationCount: number = 0,
  hasDataSource: boolean = true,
  hasCitation: boolean = true,
  correctionHours: number | null = null,
  hasConflict: boolean = false,
): Source {
  const recencyScore = calculateRecencyScore(publishDate);
  const corroborationScore = calculateCorroborationScore(crossValidationCount);
  const authorCredScore = calculateAuthorCredibilityScore(publisher);
  const transparencyScore = calculateTransparencyScore(hasDataSource, hasCitation);
  const correctionScore = calculateCorrectionSpeedScore(correctionHours);
  const conflictScore = calculateConflictOfInterestScore(hasConflict);

  // BaseScore는 출처의 기본 신뢰도
  const baseScore = authorCredScore;

  const trustScore = calculateTrustScore({
    baseScore,
    recency: recencyScore,
    corroboration: corroborationScore,
    authorCredibility: authorCredScore,
    transparency: transparencyScore,
    correctionSpeed: correctionScore,
    conflictOfInterest: conflictScore,
  });

  const grade = determineSourceGrade(trustScore, publisher);
  const misinfoType = determineMisinfoType(trustScore, crossValidationCount);

  return {
    url,
    title,
    publisher,
    publishDate,
    grade,
    trustScore: Math.round(trustScore),
    baseScore,
    recency: recencyScore,
    corroboration: corroborationScore,
    authorCredibility: authorCredScore,
    transparency: transparencyScore,
    correctionSpeed: correctionScore,
    conflictOfInterest: conflictScore,
    crossValidationCount,
    misinfoType,
    adoptedInAnalysis: misinfoType === 'VERIFIED',
    reasoning: `TrustScore ${Math.round(trustScore)}, ${crossValidationCount}개 교차검증, ${misinfoType}`,
  };
}

/**
 * 출처 필터링 및 정렬
 * TrustScore 높은 순으로 정렬
 */
export function filterAndSortSources(
  sources: Source[],
  minTrustScore: number = SAVL_THRESHOLDS.VERIFIED_MIN,
): Source[] {
  return sources
    .filter((s) => s.trustScore >= minTrustScore && s.misinfoType === 'VERIFIED')
    .sort((a, b) => b.trustScore - a.trustScore);
}

/**
 * Source Backtracking
 * 상위 출처 재검증
 */
export function performSourceBacktracking(sources: Source[], topN: number = 3): Source[] {
  const topSources = sources.sort((a, b) => b.trustScore - a.trustScore).slice(0, topN);

  // 재검증 로직 (실제로는 외부 API 호출)
  return topSources.map((source) => {
    if (source.trustScore < SAVL_THRESHOLDS.VERIFIED_MIN || source.misinfoType !== 'VERIFIED') {
      // A/A+ 대체 출처 찾기 (placeholder)
      console.warn(`Source ${source.title} needs replacement - TrustScore: ${source.trustScore}`);
    }

    return source;
  });
}
