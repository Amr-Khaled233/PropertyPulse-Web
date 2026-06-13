// Scenario comparison — Cash vs developer installment vs bank mortgage.
// Computed client-side with the shared financial engine (instant, trustworthy).

import { useMemo } from 'react';
import type { FinancialAssumptions, PropertyType } from '@propertypulse/shared-types';
import { computeInvestmentMetrics, estimateMonthlyRent } from '@propertypulse/shared-utils';
import { useI18n } from '../../../i18n';
import { formatCompactCurrency, formatPercent } from '../../../utils/formatters';

interface Scenario {
  key: string;
  labelKey: 'scenario.cash' | 'scenario.installment' | 'scenario.mortgage';
  downPaymentPct: number;
  loanInterestRate: number;
  loanTermYears: number;
}

const SCENARIOS: Scenario[] = [
  { key: 'cash', labelKey: 'scenario.cash', downPaymentPct: 100, loanInterestRate: 0, loanTermYears: 1 },
  { key: 'installment', labelKey: 'scenario.installment', downPaymentPct: 40, loanInterestRate: 0, loanTermYears: 6 },
  { key: 'mortgage', labelKey: 'scenario.mortgage', downPaymentPct: 20, loanInterestRate: 6.5, loanTermYears: 20 },
];

export function ScenarioPanel({ price, currency, areaSqm, type }: { price: number; currency: string; areaSqm: number; type: PropertyType }) {
  const { t } = useI18n();

  const results = useMemo(() => {
    const monthlyRent = estimateMonthlyRent(areaSqm, type);
    return SCENARIOS.map((s) => {
      const a: FinancialAssumptions = {
        purchasePrice: price,
        downPaymentPct: s.downPaymentPct,
        loanInterestRate: s.loanInterestRate,
        loanTermYears: s.loanTermYears,
        monthlyRent,
        vacancyRatePct: 8,
        monthlyExpenses: Math.round(monthlyRent * 0.3),
        annualAppreciationPct: 12,
        closingCosts: Math.round(price * 0.03),
      };
      const downPayment = price * (s.downPaymentPct / 100);
      return { s, metrics: computeInvestmentMetrics(a), cashInvested: downPayment + a.closingCosts };
    });
  }, [price, areaSqm, type]);

  const rows: { label: string; get: (r: (typeof results)[number]) => string; positive?: (r: (typeof results)[number]) => boolean }[] = [
    { label: t('scenario.cashInvested'), get: (r) => formatCompactCurrency(r.cashInvested, currency) },
    { label: t('scenario.monthlyCashFlow'), get: (r) => formatCompactCurrency(Math.round(r.metrics.monthlyCashFlow), currency), positive: (r) => r.metrics.monthlyCashFlow >= 0 },
    { label: t('scenario.cashOnCash'), get: (r) => formatPercent(r.metrics.cashOnCashReturn), positive: (r) => r.metrics.cashOnCashReturn >= 0 },
    { label: t('scenario.fiveYrRoi'), get: (r) => formatPercent(r.metrics.fiveYearRoi), positive: (r) => r.metrics.fiveYearRoi >= 0 },
  ];

  const descKey: Record<string, 'scenario.cashDesc' | 'scenario.installmentDesc' | 'scenario.mortgageDesc'> = {
    cash: 'scenario.cashDesc', installment: 'scenario.installmentDesc', mortgage: 'scenario.mortgageDesc',
  };

  return (
    <div className="card card-pad">
      <span className="eyebrow">📊 {t('scenario.eyebrow')}</span>
      <h3 style={{ margin: '4px 0 4px' }}>{t('scenario.title')}</h3>
      <p className="muted" style={{ margin: '0 0 12px', fontSize: '0.86rem' }}>{t('scenario.intro')}</p>
      <div className="table-scroll">
        <table className="table compare-table">
          <thead>
            <tr>
              <th></th>
              {results.map((r) => (
                <th key={r.s.key}>
                  <div>{t(r.s.labelKey)}</div>
                  <small className="muted" style={{ fontWeight: 400, display: 'block', marginTop: 2 }}>{t(descKey[r.s.key])}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="muted"><strong>{row.label}</strong></td>
                {results.map((r) => (
                  <td key={r.s.key} style={row.positive ? { color: row.positive(r) ? 'var(--green)' : '#dc2626', fontWeight: 600 } : {}}>
                    {row.get(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="muted" style={{ fontSize: '0.78rem', marginTop: 8 }}>{t('scenario.note')}</div>
    </div>
  );
}
