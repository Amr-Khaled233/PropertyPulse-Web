// Prompt template for generating the narrative part of an investment report.
// The numeric metrics and risk are computed/assessed beforehand and passed in as
// grounding facts — the LLM only explains and recommends, it never invents numbers.

import type { Property, InvestmentMetrics, RiskAssessment } from '@propertypulse/shared-types';

export interface InvestmentReportPromptInput {
  property: Property;
  metrics: InvestmentMetrics;
  risk: RiskAssessment;
  context: string;
}

export interface InvestmentReportPromptOutput {
  system: string;
  user: string;
}

export function buildInvestmentReportPrompt(
  input: InvestmentReportPromptInput,
): InvestmentReportPromptOutput {
  const { property, metrics, risk, context } = input;

  const system = [
    'You are PropertyPulse, an expert real-estate investment analyst.',
    'Write a clear, data-driven and trustworthy assessment for an individual investor.',
    'Base every claim ONLY on the provided metrics, risk assessment and retrieved context.',
    'Do not invent numbers. Be concise and explainable.',
    'Respond ONLY with JSON matching: ',
    '{ "summary": string, "recommendation": "buy" | "hold" | "avoid", "confidence": number (0-1) }',
  ].join(' ');

  const user = `
PROPERTY
${property.title} — ${property.type} in ${property.address.city}, ${property.address.country}
Price: ${property.price} ${property.currency} | Area: ${property.areaSqm} m² | Beds: ${property.bedrooms} | Baths: ${property.bathrooms}

COMPUTED METRICS
- Gross rental yield: ${metrics.grossRentalYield.toFixed(2)}%
- Net rental yield: ${metrics.netRentalYield.toFixed(2)}%
- Cap rate: ${metrics.capRate.toFixed(2)}%
- Cash-on-cash return: ${metrics.cashOnCashReturn.toFixed(2)}%
- Monthly cash flow: ${metrics.monthlyCashFlow.toFixed(0)} ${property.currency}
- Break-even: ${Number.isFinite(metrics.breakEvenYears) ? metrics.breakEvenYears.toFixed(1) + ' years' : 'never (negative cash flow)'}
- 5-year ROI: ${metrics.fiveYearRoi.toFixed(1)}%

RISK ASSESSMENT
Overall: ${risk.overall} (score ${risk.score}/100)
${risk.factors.map((f) => `- ${f.name} [${f.level}]: ${f.explanation}`).join('\n')}

RETRIEVED MARKET CONTEXT
${context || 'No additional context retrieved.'}

Write the investment summary and a recommendation now.`.trim();

  return { system, user };
}
