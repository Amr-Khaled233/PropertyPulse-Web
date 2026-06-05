// Report generator agent — synthesizes the qualitative report via the LLM, grounded in
// the computed metrics, an LLM risk assessment, and retrieved market context.

import type { Property, InvestmentMetrics, RiskAssessment } from '@propertypulse/shared-types';
import { geminiClient } from '../llm/geminiClient.js';
import { buildInvestmentReportPrompt } from '../llm/prompts/investmentReport.prompt.js';
import { buildRiskAssessmentPrompt } from '../llm/prompts/riskAssessment.prompt.js';
import type { MarketContext } from './marketDataAgent.js';

export interface GeneratedReport {
  risk: RiskAssessment;
  summary: string;
  recommendation: 'buy' | 'hold' | 'avoid';
  confidence: number;
}

interface NarrativeResponse {
  summary: string;
  recommendation: 'buy' | 'hold' | 'avoid';
  confidence: number;
}

export async function generateReport(params: {
  property: Property;
  metrics: InvestmentMetrics;
  market: MarketContext;
}): Promise<GeneratedReport> {
  const { property, metrics, market } = params;
  const context = market.retrieval.context;

  // 1) Assess risk (structured) using the dedicated prompt.
  const riskPrompt = buildRiskAssessmentPrompt({ property, metrics, context });
  const risk = await geminiClient.generateJSON<RiskAssessment>(riskPrompt.user, {
    system: riskPrompt.system,
    temperature: 0.2,
  });

  // 2) Generate the narrative + recommendation grounded in metrics + risk + context.
  const reportPrompt = buildInvestmentReportPrompt({ property, metrics, risk, context });
  const narrative = await geminiClient.generateJSON<NarrativeResponse>(reportPrompt.user, {
    system: reportPrompt.system,
    temperature: 0.4,
  });

  return {
    risk,
    summary: narrative.summary,
    recommendation: narrative.recommendation,
    confidence: narrative.confidence,
  };
}
