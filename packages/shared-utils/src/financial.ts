// Core real-estate investment calculations shared across all apps.
// Pure functions — no side effects — so they are trivially testable and reusable
// by the server's calculation agent and by client-side previews.

import type { FinancialAssumptions, InvestmentMetrics } from '@propertypulse/shared-types';

/** Monthly mortgage payment using the standard amortization formula. */
export function monthlyMortgagePayment(
  principal: number,
  annualInterestRate: number,
  termYears: number,
): number {
  if (principal <= 0) return 0;
  const r = annualInterestRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/** Gross rental yield = annual rent / purchase price. */
export function grossRentalYield(annualRent: number, price: number): number {
  return price > 0 ? (annualRent / price) * 100 : 0;
}

/** Net rental yield = (annual rent - annual expenses) / price. */
export function netRentalYield(annualRent: number, annualExpenses: number, price: number): number {
  return price > 0 ? ((annualRent - annualExpenses) / price) * 100 : 0;
}

/** Capitalization rate = net operating income / property value. */
export function capRate(netOperatingIncome: number, price: number): number {
  return price > 0 ? (netOperatingIncome / price) * 100 : 0;
}

/** Compute the full set of investment metrics from a set of assumptions. */
export function computeInvestmentMetrics(a: FinancialAssumptions): InvestmentMetrics {
  const downPayment = a.purchasePrice * (a.downPaymentPct / 100);
  const loanAmount = a.purchasePrice - downPayment;
  const cashInvested = downPayment + a.closingCosts;

  const effectiveMonthlyRent = a.monthlyRent * (1 - a.vacancyRatePct / 100);
  const annualRent = effectiveMonthlyRent * 12;
  const annualExpenses = a.monthlyExpenses * 12;
  const noi = annualRent - annualExpenses;

  const mortgage = monthlyMortgagePayment(loanAmount, a.loanInterestRate, a.loanTermYears);
  const monthlyCashFlow = effectiveMonthlyRent - a.monthlyExpenses - mortgage;
  const annualCashFlow = monthlyCashFlow * 12;

  const fiveYearAppreciation =
    a.purchasePrice * (Math.pow(1 + a.annualAppreciationPct / 100, 5) - 1);
  const fiveYearRoi =
    cashInvested > 0 ? ((annualCashFlow * 5 + fiveYearAppreciation) / cashInvested) * 100 : 0;

  return {
    grossRentalYield: grossRentalYield(annualRent, a.purchasePrice),
    netRentalYield: netRentalYield(annualRent, annualExpenses, a.purchasePrice),
    capRate: capRate(noi, a.purchasePrice),
    cashOnCashReturn: cashInvested > 0 ? (annualCashFlow / cashInvested) * 100 : 0,
    monthlyCashFlow,
    annualCashFlow,
    breakEvenYears: annualCashFlow > 0 ? cashInvested / annualCashFlow : Infinity,
    fiveYearRoi,
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : 0));
}

/** Typical monthly rent per m² (EGP) by property type — Cairo/Giza market.
 *  Estimating rent from AREA (not a flat % of price) makes the rental yield
 *  vary realistically per property: a unit priced cheaply per m² yields more,
 *  an expensive one yields less. */
export const RENT_PER_SQM_BY_TYPE: Record<string, number> = {
  apartment: 320,
  house: 300,
  villa: 250,
  townhouse: 280,
  commercial: 450,
  land: 60,
};

export function estimateMonthlyRent(areaSqm: number, type: string): number {
  const rate = RENT_PER_SQM_BY_TYPE[type] ?? 300;
  return Math.round(Math.max(0, areaSqm) * rate);
}

export type Recommendation = 'buy' | 'hold' | 'avoid';

/**
 * Derive a grounded buy/hold/avoid recommendation from the computed metrics and
 * how the property is priced versus comparable listings. Deterministic (not
 * LLM-decided) so the verdict is consistent and actually varies by property:
 *  - strong total return + fair/undervalued pricing → buy
 *  - mixed → hold
 *  - weak yields + overpriced vs comps → avoid
 *
 * @param pricePositionPct  subject price/m² vs comparable average (+ = pricier).
 */
export function deriveRecommendation(
  m: InvestmentMetrics,
  pricePositionPct = 0,
): { recommendation: Recommendation; confidence: number; score: number } {
  let score = 50;
  score += (m.capRate - 6) * 4; // cap rate vs a 6% benchmark
  score += clamp(m.cashOnCashReturn, -20, 20) * 1.2; // operating cash return
  score += clamp(m.fiveYearRoi, -50, 150) * 0.22; // total 5y return (capped)
  score -= clamp(pricePositionPct, -60, 60) * 1.1; // overpriced vs comps hurts
  score = clamp(score, 0, 100);

  const recommendation: Recommendation = score >= 62 ? 'buy' : score >= 42 ? 'hold' : 'avoid';
  const confidence = Math.round((0.62 + Math.abs(score - 50) / 130) * 100) / 100;
  return { recommendation, confidence: Math.min(confidence, 0.97), score: Math.round(score) };
}
