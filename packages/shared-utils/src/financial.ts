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
