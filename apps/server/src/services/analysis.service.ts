// Analysis service — on-demand metric computation and property comparison.

import type { Property, InvestmentMetrics, FinancialAssumptions } from '@propertypulse/shared-types';
import { propertyService } from './property.service.js';
import { calculateMetrics, type AssumptionOverrides } from '../ai/agents/calculationAgent.js';
import { geminiClient } from '../ai/llm/geminiClient.js';
import {
  buildPropertyComparisonPrompt,
  type ComparisonCandidate,
} from '../ai/llm/prompts/propertyComparison.prompt.js';

export interface MetricsResult {
  assumptions: FinancialAssumptions;
  metrics: InvestmentMetrics;
}

export interface ComparisonResult {
  ranking: { propertyId: string; rank: number; rationale: string }[];
  verdict: string;
}

export const analysisService = {
  /** Compute metrics for a stored property with optional assumption overrides. */
  async computeForProperty(propertyId: string, overrides: AssumptionOverrides = {}): Promise<MetricsResult> {
    const property = await propertyService.getById(propertyId);
    return calculateMetrics(property, overrides);
  },

  /** Compute metrics for an ad-hoc property payload (not stored). */
  computeForPayload(property: Property, overrides: AssumptionOverrides = {}): MetricsResult {
    return calculateMetrics(property, overrides);
  },

  /** Rank multiple stored properties using their computed metrics + the LLM. */
  async compare(propertyIds: string[]): Promise<ComparisonResult> {
    const candidates: ComparisonCandidate[] = [];
    for (const id of propertyIds) {
      const property = await propertyService.getById(id);
      const { metrics } = calculateMetrics(property);
      candidates.push({ property, metrics });
    }

    const prompt = buildPropertyComparisonPrompt(candidates);
    return geminiClient.generateJSON<ComparisonResult>(prompt.user, {
      system: prompt.system,
      temperature: 0.3,
    });
  },
};
