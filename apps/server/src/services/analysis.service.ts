// Analysis service — on-demand metric computation and property comparison.

import type { Property, InvestmentMetrics, FinancialAssumptions } from '@propertypulse/shared-types';
import { deriveRecommendation, type Recommendation } from '@propertypulse/shared-utils';
import { propertyService } from './property.service.js';
import { propertyRepository } from '../repositories/property.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { usageRepository } from '../repositories/usage.repository.js';
import { comparisonRepository, type SavedComparison } from '../repositories/comparison.repository.js';
import { calculateMetrics, type AssumptionOverrides } from '../ai/agents/calculationAgent.js';
import { geminiClient } from '../ai/llm/geminiClient.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

/** Free plan: how many AI comparisons per month. Paid plans are unlimited. */
const FREE_COMPARE_LIMIT = 1;
function startOfMonthISO(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1)).toISOString();
}

/** Median — robust to luxury outliers when benchmarking price/m². */
function median(arr: number[]): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
import {
  buildPropertyComparisonPrompt,
  type ComparisonCandidate,
} from '../ai/llm/prompts/propertyComparison.prompt.js';

/** Deterministic, metric-grounded reasoning bullets for a compared property —
 *  mirrors the mobile app's per-candidate "AI Reasoning" list. Always available
 *  (doesn't depend on the LLM) so every candidate shows a full rationale. */
function buildCandidateReasoning(
  property: Property,
  m: InvestmentMetrics,
  pricePerSqm: number,
  pricePositionPct: number,
  lang?: 'en' | 'ar',
): string[] {
  const ar = lang === 'ar';
  const ccy = property.currency;
  const num = (v: number) => Math.round(v).toLocaleString('en-US');
  const pct = (v: number) => `${v.toFixed(1)}%`;
  const city = property.address.city;
  const roi = m.fiveYearRoi;
  const cf = Math.round(m.monthlyCashFlow);
  const cap = m.capRate;
  const under = pricePositionPct < 0;
  const absPos = Math.abs(pricePositionPct);
  const strongYield = m.netRentalYield >= 7;
  const isApt = property.type === 'apartment';
  const bullets: string[] = [];

  bullets.push(
    ar
      ? `العائد الإيجاري الصافي ${pct(m.netRentalYield)} ${strongYield ? 'قوي بشكل لافت' : m.netRentalYield >= 4 ? 'معقول' : 'منخفض'} لسوق ${city} السكني.`
      : `The net rental yield of ${pct(m.netRentalYield)} is ${strongYield ? 'exceptionally strong' : m.netRentalYield >= 4 ? 'reasonable' : 'on the low side'} for the ${city} residential market.`,
  );
  bullets.push(
    ar
      ? `توقّع العائد على 5 سنوات عند ${pct(roi)}، ما يشير إلى ${roi >= 100 ? 'إمكانات نمو رأسمالي كبيرة' : 'نمو رأسمالي معتدل'} للمستثمر.`
      : `The 5-year ROI outlook stands at ${pct(roi)}, indicating ${roi >= 100 ? 'substantial capital appreciation' : 'moderate capital growth'} potential for the investor.`,
  );
  bullets.push(
    cf >= 0
      ? ar
        ? `تدفّق نقدي شهري موجب قدره ${num(cf)} ${ccy} يعني سيولة فورية وأصلًا يغطّي مصاريفه ذاتيًا.`
        : `A positive monthly cash flow of ${num(cf)} ${ccy} implies immediate liquidity and a self-sustaining asset that covers its own expenses.`
      : ar
        ? `تدفّق نقدي شهري سالب قدره ${num(Math.abs(cf))} ${ccy} يتطلّب تمويلًا إضافيًا قبل أن يصبح الأصل مكتفيًا ذاتيًا.`
        : `A negative monthly cash flow of ${num(Math.abs(cf))} ${ccy} means the asset needs topping up before it becomes self-sustaining.`,
  );
  bullets.push(
    ar
      ? `عند نحو ${num(pricePerSqm)} ${ccy} للمتر المربع، هذا العقار ${under ? 'أقل من' : 'أعلى من'} متوسّط السوق المحلي بحوالي ${pct(absPos)}.`
      : `At approximately ${num(pricePerSqm)} ${ccy} per square meter, this property is ${under ? 'underpriced compared to' : 'priced above'} the local market average by about ${pct(absPos)}.`,
  );
  bullets.push(
    ar
      ? `معدّل العائد الرأسمالي ${pct(cap)} ${cap >= 6 ? 'يتجاوز' : 'دون'} مرجعية السوق المعتادة 6–8%.`
      : `The cap rate of ${pct(cap)} ${cap >= 6 ? 'comfortably exceeds' : 'sits below'} the typical 6–8% market benchmark.`,
  );
  bullets.push(
    ar
      ? `من أبرز نقاط القوّة ${under ? 'نقطة الدخول السعرية المنخفضة' : 'جودة الموقع'}، بينما من المخاطر المحتملة ${isApt ? 'ارتفاع معدّل دوران المستأجرين المعتاد في الشقق' : 'تكاليف الصيانة الأعلى'}.`
      : `A key strength is its ${under ? 'accessible entry price' : 'location quality'}, while a potential risk is ${isApt ? 'the higher tenant turnover typical of apartments' : 'higher maintenance costs'}.`,
  );

  return bullets;
}

export interface MetricsResult {
  assumptions: FinancialAssumptions;
  metrics: InvestmentMetrics;
}

export interface ComparisonCandidateOut {
  property: Property;
  metrics: InvestmentMetrics;
  recommendation: Recommendation;
  pricePerSqm: number;
  pricePositionPct: number;
  score: number; // deterministic investment score 0–100
  reasoning: string[]; // metric-grounded "AI Reasoning" bullets (per candidate)
}

export interface ComparisonResult {
  candidates: ComparisonCandidateOut[];
  ranking: { propertyId: string; rank: number; rationale: string }[];
  verdict: string;
}

export interface NegotiationResult {
  askingPrice: number;
  currency: string;
  fairValue: number;
  pricePerSqm: number;
  marketAvgPerSqm: number;
  deltaPct: number; // asking vs fair value
  suggestedOffer: number;
  compCount: number;
  tips: string[];
  summary: string;
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

  /** Rank multiple stored properties using their computed metrics + the LLM.
   *  The deterministic metrics/recommendation always come back; the AI ranking
   *  is best-effort (skipped gracefully if the model is unavailable). */
  async compare(propertyIds: string[], lang?: 'en' | 'ar', userId?: string): Promise<ComparisonResult> {
    // Free plan: limit AI comparisons. Paid plans (pro/enterprise) are unlimited.
    if (userId) {
      const profile = await userRepository.getById(userId);
      if ((profile?.plan ?? 'free') === 'free') {
        const used = await usageRepository.countSince(userId, 'compare', startOfMonthISO());
        if (used >= FREE_COMPARE_LIMIT) {
          throw new ApiError(
            403,
            'COMPARE_LIMIT_REACHED',
            `Free plan includes ${FREE_COMPARE_LIMIT} AI comparison per month. Upgrade to Pro for unlimited comparisons.`,
          );
        }
      }
    }

    const candidates: ComparisonCandidate[] = [];
    for (const id of propertyIds) {
      const property = await propertyService.getById(id);
      const { metrics } = calculateMetrics(property);
      candidates.push({ property, metrics });
    }

    // Price each candidate relative to the median price/m² of the compared set.
    const ppsm = candidates.map((c) => (c.property.areaSqm ? c.property.price / c.property.areaSqm : 0));
    const avg = median(ppsm.filter((v) => v > 0));

    const scored = candidates.map((c, i) => {
      const pricePositionPct = avg ? ((ppsm[i] - avg) / avg) * 100 : 0;
      const d = deriveRecommendation(c.metrics, pricePositionPct);
      return { c, i, pricePositionPct, score: d.score, recommendation: d.recommendation };
    });

    const out: ComparisonCandidateOut[] = scored.map((s) => ({
      property: s.c.property,
      metrics: s.c.metrics,
      recommendation: s.recommendation,
      pricePerSqm: Math.round(ppsm[s.i]),
      pricePositionPct: Math.round(s.pricePositionPct * 10) / 10,
      score: s.score,
      reasoning: buildCandidateReasoning(s.c.property, s.c.metrics, Math.round(ppsm[s.i]), s.pricePositionPct, lang),
    }));

    let ranking: ComparisonResult['ranking'] = [];
    let verdict = '';
    try {
      const prompt = buildPropertyComparisonPrompt(candidates, lang);
      const ai = await geminiClient.generateJSON<{ ranking: typeof ranking; verdict: string }>(prompt.user, {
        system: prompt.system,
        temperature: 0.3,
      });
      ranking = ai.ranking ?? [];
      verdict = ai.verdict ?? '';
    } catch (err) {
      logger.warn({ err }, 'AI comparison unavailable — using deterministic ranking');
    }

    // Always provide a ranking: fall back to the deterministic investment score.
    if (ranking.length === 0) {
      const ar = lang === 'ar';
      // Complementary one-liner (the numeric score is shown separately by the UI).
      const reason = (rec: Recommendation): string =>
        ar
          ? rec === 'buy'
            ? 'مسعّر بشكل جذّاب مقابل السوق المحلي — نقطة دخول جيدة.'
            : rec === 'hold'
              ? 'مسعّر بشكل عادل؛ العائد معقول لكنه ليس استثنائيًا.'
              : 'مسعّر أعلى من السوق المحلي، ما يقلّل هامش الأمان.'
          : rec === 'buy'
            ? 'Attractively priced versus the local market — a solid entry point.'
            : rec === 'hold'
              ? 'Fairly priced; returns are reasonable but not standout.'
              : 'Priced above the local market, leaving little margin of safety.';
      ranking = [...scored]
        .sort((a, b) => b.score - a.score)
        .map((s, idx) => ({ propertyId: s.c.property.id, rank: idx + 1, rationale: reason(s.recommendation) }));
      if (!verdict) {
        const best = [...scored].sort((a, b) => b.score - a.score)[0];
        verdict = ar
          ? `أفضل خيار هو "${best.c.property.title}" بأعلى درجة استثمار وأفضل تسعير مقابل السوق.`
          : `The strongest pick is "${best.c.property.title}" — highest investment score and best price vs market.`;
      }
    }

    const result: ComparisonResult = { candidates: out, ranking, verdict };
    if (userId) {
      await usageRepository.log(userId, 'compare').catch(() => {});
      // Persist the comparison so the user can revisit it (best-effort).
      void comparisonRepository.create(userId, propertyIds, result).catch(() => {});
    }
    return result;
  },

  /** A user's saved comparisons (most recent first). */
  listComparisons(userId: string): Promise<SavedComparison[]> {
    return comparisonRepository.listForUser(userId);
  },

  deleteComparison(id: string, userId: string): Promise<void> {
    return comparisonRepository.delete(id, userId);
  },

  /** Suggest a fair value + negotiation offer for a property, grounded in real
   *  comparable listings (same city/type). AI tips are best-effort. */
  async negotiation(propertyId: string, lang?: 'en' | 'ar'): Promise<NegotiationResult> {
    const property = await propertyService.getById(propertyId);
    const comps = await propertyRepository.findComparables(
      { city: property.address.city, district: property.address.state, type: property.type, excludeId: property.id },
      20,
    );

    const ppsmList = comps.map((c) => (c.areaSqm ? c.price / c.areaSqm : 0)).filter((v) => v > 0);
    const marketAvgPerSqm = median(ppsmList);
    const pricePerSqm = property.areaSqm ? property.price / property.areaSqm : 0;

    const fairValue = marketAvgPerSqm && property.areaSqm
      ? Math.round(marketAvgPerSqm * property.areaSqm)
      : property.price;
    const deltaPct = fairValue ? ((property.price - fairValue) / fairValue) * 100 : 0;
    // Anchor below the lower of asking/fair value, leaving a negotiation margin.
    const suggestedOffer = Math.round(Math.min(property.price, fairValue) * 0.96);

    // Deterministic tips (always available), localized.
    const ar = lang === 'ar';
    const tips: string[] = [];
    if (deltaPct > 5) {
      tips.push(ar
        ? `العقار مسعّر أعلى من متوسط السوق بـ ${deltaPct.toFixed(0)}% — استخدم ده كورقة تفاوض قوية.`
        : `Priced ${deltaPct.toFixed(0)}% above the area average — use this as strong leverage.`);
    } else if (deltaPct < -5) {
      tips.push(ar
        ? `مسعّر أقل من السوق بـ ${Math.abs(deltaPct).toFixed(0)}% — فرصة جيدة، تحرّك بسرعة قبل ما يتباع.`
        : `Priced ${Math.abs(deltaPct).toFixed(0)}% below market — a good deal; move quickly.`);
    } else {
      tips.push(ar ? 'السعر قريب من قيمة السوق العادلة.' : 'Priced close to fair market value.');
    }
    tips.push(ar
      ? `قيمة السوق العادلة المقدّرة ≈ ${fairValue.toLocaleString()} ${property.currency} (من ${comps.length} عقار مشابه).`
      : `Estimated fair value ≈ ${fairValue.toLocaleString()} ${property.currency} (from ${comps.length} comparables).`);
    tips.push(ar
      ? 'اطلب الدفع كاش أو دفعة مقدمة أكبر مقابل خصم إضافي 3-5%.'
      : 'Offer cash or a larger down payment in exchange for an extra 3–5% discount.');

    // Optional AI narrative summary (graceful).
    let summary = '';
    try {
      const sys = ar
        ? 'أنت مستشار عقاري. اكتب جملة أو جملتين بالعربية تنصح المشتري بخصوص التفاوض على هذا العقار بناءً على الأرقام. كن محددًا وعمليًا.'
        : 'You are a real-estate advisor. In 1–2 sentences, advise the buyer on negotiating this property based on the numbers. Be concrete and practical.';
      const user = `Asking: ${property.price} ${property.currency}. Fair value: ${fairValue}. ${deltaPct >= 0 ? 'Above' : 'Below'} market by ${Math.abs(deltaPct).toFixed(0)}%. Suggested offer: ${suggestedOffer}.`;
      summary = await geminiClient.generate(user, { system: sys, temperature: 0.4 });
    } catch (err) {
      logger.warn({ err }, 'Negotiation AI summary unavailable');
    }

    return {
      askingPrice: property.price,
      currency: property.currency,
      fairValue,
      pricePerSqm: Math.round(pricePerSqm),
      marketAvgPerSqm: Math.round(marketAvgPerSqm),
      deltaPct: Math.round(deltaPct * 10) / 10,
      suggestedOffer,
      compCount: comps.length,
      tips,
      summary,
    };
  },
};
