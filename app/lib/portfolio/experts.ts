/**
 * AI 전문가 집단지성 시스템
 * 8명의 전문가 페르소나를 시뮬레이션하여 합의 도출
 */

import { ExpertType } from '~/types/portfolio.types';
import type { ExpertAnalysis, ExpertConsensus, Asset, AssetCategory } from '~/types/portfolio.types';
import { EXPERT_WEIGHTS, EXPERT_DESCRIPTIONS, INVESTMENT_GOALS } from './constants';

/**
 * AI 전문가 프롬프트 생성
 */
export function createExpertPrompt(expertType: ExpertType, asset: Asset | AssetCategory, context: string): string {
  const expert = EXPERT_DESCRIPTIONS[expertType];

  const assetInfo =
    'ticker' in asset
      ? `종목: ${asset.name} (${asset.ticker})\n산업: ${asset.industry}\n주요 성장 포인트: ${asset.keyGrowthPoints.join(', ')}\n예상 CAGR: ${asset.expectedCAGR}%`
      : `자산 카테고리: ${asset.name}\n성장성: ${asset.growthScore}/10\n혁신성: ${asset.innovationScore}/10`;

  return `당신은 ${expert.role} 전문가입니다.
평가 기준: ${expert.criteria.join(', ')}

다음 투자 대상을 분석해주세요:

${assetInfo}

컨텍스트:
${context}

다음 형식으로 답변해주세요:
1. 핵심 평가 (3-5개 bullet points)
2. 점수 (1-10)
3. 상세 근거 (2-3 문장)
4. 우려사항 (있다면 1-2개)

목표: 장기 가치투자 (5년 이상), CAGR 30% 이상, 낮은 리스크`;
}

/**
 * AI 응답을 ExpertAnalysis로 파싱
 */
export function parseExpertResponse(expertType: ExpertType, response: string): ExpertAnalysis {
  // 간단한 파싱 로직 (실제로는 더 robust한 파싱 필요)
  const lines = response.split('\n').filter((l) => l.trim());

  // 점수 추출 (예: "점수: 8/10" 또는 "Score: 8")
  const scoreMatch = response.match(/(?:점수|Score):\s*(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 7;

  // 핵심 포인트 추출
  const keyPoints: string[] = [];
  let inKeyPoints = false;

  for (const line of lines) {
    if (line.match(/핵심|평가|Key|Points/i)) {
      inKeyPoints = true;
      continue;
    }

    if (inKeyPoints && (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))) {
      keyPoints.push(line.replace(/^[-•\d.]\s*/, '').trim());
    }

    if (line.match(/점수|근거|우려|Score|Reasoning|Concerns/i)) {
      inKeyPoints = false;
    }
  }

  // 우려사항 추출
  const concerns: string[] = [];
  const concernsSection = response.match(/우려사항.*?:(.*?)(?:\n\n|$)/is);

  if (concernsSection) {
    const concernLines = concernsSection[1].split('\n').filter((l) => l.trim());
    concernLines.forEach((line) => {
      if (line.startsWith('-') || line.startsWith('•')) {
        concerns.push(line.replace(/^[-•]\s*/, '').trim());
      }
    });
  }

  return {
    expertType,
    perspective: EXPERT_DESCRIPTIONS[expertType].role,
    keyPoints: keyPoints.slice(0, 5),
    score: Math.max(1, Math.min(10, score)),
    reasoning: response.substring(0, 500), // 전체 응답의 일부
    concerns: concerns.length > 0 ? concerns : undefined,
  };
}

/**
 * 전문가 합의 점수 계산 (가중 평균)
 */
export function calculateConsensusScore(analyses: ExpertAnalysis[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const analysis of analyses) {
    const weight = EXPERT_WEIGHTS[analysis.expertType];
    weightedSum += analysis.score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * BiasGuard 트리거 확인
 * 60% 이상의 전문가가 동일 섹터 선택 시 경고
 */
export function checkBiasGuard(
  analyses: ExpertAnalysis[],
  threshold: number = INVESTMENT_GOALS.BIAS_GUARD_THRESHOLD,
): boolean {
  // 긍정적 평가 (점수 >= 7)를 한 전문가 비율
  const positiveCount = analyses.filter((a) => a.score >= 7).length;
  const ratio = positiveCount / analyses.length;

  return ratio >= threshold;
}

/**
 * 반대 의견 추출
 */
export function extractDissentingOpinion(analyses: ExpertAnalysis[]): string | undefined {
  // 가장 낮은 점수를 준 전문가의 우려사항
  const sortedByScore = [...analyses].sort((a, b) => a.score - b.score);
  const lowestScore = sortedByScore[0];

  if (lowestScore && lowestScore.concerns && lowestScore.concerns.length > 0) {
    return `${EXPERT_DESCRIPTIONS[lowestScore.expertType].role}: ${lowestScore.concerns[0]}`;
  }

  return undefined;
}

/**
 * 상위 3개 합의 이유 추출
 */
export function extractTopReasons(analyses: ExpertAnalysis[]): string[] {
  const allKeyPoints: string[] = [];

  for (const analysis of analyses) {
    allKeyPoints.push(...analysis.keyPoints);
  }

  /*
   * 빈도수 기반으로 상위 3개 선택 (간단한 구현)
   * 실제로는 semantic similarity 등 사용 가능
   */
  const uniquePoints = [...new Set(allKeyPoints)];

  return uniquePoints.slice(0, 3);
}

/**
 * 전문가 합의 생성
 */
export function createExpertConsensus(analyses: ExpertAnalysis[]): ExpertConsensus {
  const consensusScore = calculateConsensusScore(analyses);
  const topReasons = extractTopReasons(analyses);
  const dissentingOpinion = extractDissentingOpinion(analyses);
  const biasGuardTriggered = checkBiasGuard(analyses);

  return {
    analyses,
    consensusScore: Math.round(consensusScore * 10) / 10,
    topReasons,
    dissentingOpinion,
    biasGuardTriggered,
  };
}

/**
 * 논쟁적 토론 시뮬레이션
 * 전문가 점수 차이가 3점 이상일 때 발동
 */
export function needsDebate(analyses: ExpertAnalysis[]): boolean {
  if (analyses.length < 2) {
    return false;
  }

  const scores = analyses.map((a) => a.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  return maxScore - minScore > 3;
}

/**
 * 모의 전문가 분석 생성 (테스트용 - 실제로는 AI API 호출)
 */
export function createMockExpertAnalysis(
  expertType: ExpertType,
  asset: Asset | AssetCategory,
  baseScore: number = 7.5,
): ExpertAnalysis {
  const expert = EXPERT_DESCRIPTIONS[expertType];
  const variance = (Math.random() - 0.5) * 2; // -1 ~ +1
  const score = Math.max(1, Math.min(10, baseScore + variance));

  const assetName = 'ticker' in asset ? asset.name : asset.name;

  return {
    expertType,
    perspective: expert.role,
    keyPoints: [
      `${assetName}의 ${expert.criteria[0]} 분석 결과 긍정적`,
      `${expert.criteria[1]} 측면에서 성장 잠재력 확인`,
      `장기적 관점에서 ${expert.criteria[2] || expert.criteria[0]} 유망`,
    ],
    score: Math.round(score * 10) / 10,
    reasoning: `${expert.role} 관점에서 ${assetName}을 분석한 결과, ${expert.criteria.join(', ')} 측면에서 ${score >= 7 ? '긍정적' : '보통'} 평가됩니다.`,
    concerns: score < 7 ? ['단기 변동성 우려', '시장 불확실성'] : undefined,
  };
}

/**
 * 전체 전문가 패널 분석 실행
 * (실제로는 AI API 호출, 여기서는 모의 데이터)
 */
export async function runExpertPanel(
  asset: Asset | AssetCategory,
  context: string,
  useRealAI: boolean = false,
): Promise<ExpertConsensus> {
  const expertTypes = Object.values(ExpertType) as ExpertType[];
  const analyses: ExpertAnalysis[] = [];

  for (const expertType of expertTypes) {
    if (useRealAI) {
      /*
       * TODO: 실제 AI API 호출
       * const prompt = createExpertPrompt(expertType, asset, context);
       * const response = await callAIAPI(prompt);
       * const analysis = parseExpertResponse(expertType, response);
       * analyses.push(analysis);
       */

      // 임시로 모의 데이터 사용
      analyses.push(createMockExpertAnalysis(expertType, asset));
    } else {
      // 모의 데이터
      analyses.push(createMockExpertAnalysis(expertType, asset));
    }
  }

  // 논쟁이 필요한 경우 재분석 (간소화)
  if (needsDebate(analyses)) {
    console.log('Expert debate triggered - score variance > 3 points');

    // 실제로는 3라운드 토론 시뮬레이션
  }

  return createExpertConsensus(analyses);
}

/**
 * 카테고리별 전문가 패널 실행
 */
export async function analyzeCategories(
  categories: AssetCategory[],
  context: string,
): Promise<Map<string, ExpertConsensus>> {
  const results = new Map<string, ExpertConsensus>();

  for (const category of categories) {
    const consensus = await runExpertPanel(category, context, false);
    results.set(category.name, consensus);
  }

  return results;
}

/**
 * 종목별 전문가 패널 실행
 */
export async function analyzeAssets(assets: Asset[], context: string): Promise<Map<string, ExpertConsensus>> {
  const results = new Map<string, ExpertConsensus>();

  for (const asset of assets) {
    const consensus = await runExpertPanel(asset, context, false);
    results.set(asset.ticker, consensus);
  }

  return results;
}
