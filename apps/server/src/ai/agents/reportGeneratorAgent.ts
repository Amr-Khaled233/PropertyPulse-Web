// Report generator agent — synthesizes the qualitative report. The numeric
// verdict + metrics are deterministic; the LLM only adds narrative/risk prose.
// If the LLM is unavailable (quota/outage) we fall back to a grounded,
// template-based report so generation NEVER hard-fails.

import type { Property, InvestmentMetrics, RiskAssessment, RiskLevel } from '@propertypulse/shared-types';
import { deriveRecommendation } from '@propertypulse/shared-utils';
import { geminiClient } from '../llm/geminiClient.js';
import { buildInvestmentReportPrompt } from '../llm/prompts/investmentReport.prompt.js';
import { buildRiskAssessmentPrompt } from '../llm/prompts/riskAssessment.prompt.js';
import { logger } from '../../utils/logger.js';
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

const levelFor = (score: number): RiskLevel => (score < 34 ? 'low' : score < 67 ? 'moderate' : 'high');

/** Deterministic risk assessment from the metrics (used when the LLM is down). */
function fallbackRisk(metrics: InvestmentMetrics, pricePositionPct: number, verdictScore: number): RiskAssessment {
  const overallScore = Math.max(8, Math.min(92, 100 - verdictScore));
  const pricingLevel = levelFor(Math.min(95, Math.max(0, 40 + pricePositionPct)));
  const cashLevel: RiskLevel = metrics.monthlyCashFlow >= 0 ? 'low' : 'moderate';
  return {
    overall: levelFor(overallScore),
    score: Math.round(overallScore),
    factors: [
      {
        name: 'Pricing vs market',
        level: pricingLevel,
        weight: 0.4,
        explanation:
          pricePositionPct > 5
            ? `Priced ${pricePositionPct.toFixed(0)}% above comparable listings — limited margin of safety.`
            : pricePositionPct < -5
              ? `Priced ${Math.abs(pricePositionPct).toFixed(0)}% below comparables — favourable entry.`
              : 'Priced in line with comparable listings.',
      },
      {
        name: 'Cash flow',
        level: cashLevel,
        weight: 0.35,
        explanation:
          metrics.monthlyCashFlow >= 0
            ? 'Projected positive monthly cash flow under the base assumptions.'
            : 'Negative monthly cash flow under leverage; returns rely on appreciation.',
      },
      {
        name: 'Market & liquidity',
        level: 'moderate',
        weight: 0.25,
        explanation: 'Egyptian market: strong nominal appreciation but currency / rate volatility.',
      },
    ],
  };
}

/** Deterministic narrative summary from the numbers (used when the LLM is down).
 *  Multi-sentence and explanatory so it reads like real analysis, not raw data. */
function fallbackSummary(
  property: Property,
  metrics: InvestmentMetrics,
  verdict: 'buy' | 'hold' | 'avoid',
  pricePositionPct: number,
  lang?: 'en' | 'ar',
): string {
  const cf = Math.round(metrics.monthlyCashFlow);
  const d = Math.abs(Math.round(pricePositionPct));
  const cap = metrics.capRate.toFixed(1);
  const roi = Math.round(metrics.fiveYearRoi);
  // Cumulative 5-yr ROI → annualised so large totals (driven by leverage) read sensibly.
  const annual = Math.round((Math.pow(1 + metrics.fiveYearRoi / 100, 1 / 5) - 1) * 100);
  const price = property.price.toLocaleString();

  if (lang === 'ar') {
    const pricing = pricePositionPct <= -3
      ? `أقل من العقارات المماثلة بنحو ${d}% — نقطة دخول جذّابة`
      : pricePositionPct >= 3
        ? `أعلى من العقارات المماثلة بنحو ${d}%، ما يقلّل هامش الأمان`
        : `قريب من متوسط العقارات المماثلة`;
    const income = cf >= 0
      ? `تدفقًا نقديًا شهريًا موجبًا بنحو ${cf.toLocaleString()} ج`
      : `تدفقًا نقديًا شهريًا سالبًا (${cf.toLocaleString()} ج) في ظل التمويل، فالعائد يعتمد على ارتفاع السعر`;
    const v = verdict === 'buy' ? 'الشراء' : verdict === 'hold' ? 'الانتظار/المراقبة' : 'التجنّب';
    return `هذا ${property.type} في ${property.address.city} مطروح بسعر ${price} ${property.currency} (${property.areaSqm} م²)، وهو ${pricing}. بمعدل رسملة ~${cap}% يحقّق ${income}. وعلى مدى 5 سنوات، العائد التراكمي المتوقّع ~${roi}% (≈${annual}% سنويًا)، مدفوعًا أساسًا بارتفاع الأسعار الاسمي في مصر مع أثر التمويل. لذلك تشير البيانات إلى توصية ${v}. (الأرقام مبنية على افتراضات سوقية للإيجار والتمويل — تأكّد من الإيجار والشروط الفعلية لحالتك.)`;
  }

  const pricing = pricePositionPct <= -3
    ? `about ${d}% below comparable listings — an attractive entry point`
    : pricePositionPct >= 3
      ? `about ${d}% above comparable listings, which narrows the margin of safety`
      : `roughly in line with comparable listings`;
  const income = cf >= 0
    ? `a positive monthly cash flow of ~${cf.toLocaleString()} EGP`
    : `a negative monthly cash flow of ${cf.toLocaleString()} EGP under leverage (returns then rely on appreciation)`;
  return `This ${property.type} in ${property.address.city} is listed at ${price} ${property.currency} (${property.areaSqm} m²), ${pricing}. At an estimated ${cap}% cap rate it would generate ${income}. Over a 5-year hold the projected cumulative return is ~${roi}% (≈${annual}%/yr), driven mainly by Egypt's strong nominal price appreciation combined with leverage. The data therefore supports a "${verdict}" recommendation. (Based on market-standard rent and financing assumptions — verify the actual rent and terms for your own case.)`;
}

export async function generateReport(params: {
  property: Property;
  metrics: InvestmentMetrics;
  market: MarketContext;
  lang?: 'en' | 'ar';
}): Promise<GeneratedReport> {
  const { property, metrics, market, lang } = params;
  const context = [market.dataContext, market.retrieval.context].filter(Boolean).join('\n\n');

  // Deterministic verdict from real metrics + price-vs-comps (never the LLM's mood).
  const verdict = deriveRecommendation(metrics, market.pricePositionPct);

  // 1) Risk — LLM if available, else a grounded deterministic assessment.
  let risk: RiskAssessment;
  try {
    const riskPrompt = buildRiskAssessmentPrompt({ property, metrics, context });
    risk = await geminiClient.generateJSON<RiskAssessment>(riskPrompt.user, {
      system: riskPrompt.system,
      temperature: 0.2,
    });
  } catch (err) {
    logger.warn({ err }, 'Risk LLM unavailable — using deterministic fallback');
    risk = fallbackRisk(metrics, market.pricePositionPct, verdict.score);
  }

  // 2) Narrative — LLM if available, else a grounded template.
  let summary: string;
  try {
    const reportPrompt = buildInvestmentReportPrompt({
      property, metrics, risk, context, lang, verdict: verdict.recommendation,
    });
    const narrative = await geminiClient.generateJSON<NarrativeResponse>(reportPrompt.user, {
      system: reportPrompt.system,
      temperature: 0.4,
    });
    summary = narrative.summary;
  } catch (err) {
    logger.warn({ err }, 'Narrative LLM unavailable — using deterministic fallback');
    summary = fallbackSummary(property, metrics, verdict.recommendation, market.pricePositionPct, lang);
  }

  return {
    risk,
    summary,
    recommendation: verdict.recommendation,
    confidence: verdict.confidence,
  };
}
