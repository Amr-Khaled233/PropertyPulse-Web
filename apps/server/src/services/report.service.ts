// Report service — runs the agent pipeline and persists the resulting report.

import type { InvestmentReport } from '@propertypulse/shared-types';
import { propertyService } from './property.service.js';
import { runAnalysisPipeline } from '../ai/agents/orchestrator.js';
import { reportRepository } from '../repositories/report.repository.js';
import { ApiError } from '../utils/apiError.js';
import type { AssumptionOverrides } from '../ai/agents/calculationAgent.js';

export const reportService = {
  async generate(input: {
    userId: string;
    propertyId: string;
    assumptions?: AssumptionOverrides;
  }): Promise<InvestmentReport> {
    const property = await propertyService.getById(input.propertyId);

    const result = await runAnalysisPipeline({
      property,
      userId: input.userId,
      assumptions: input.assumptions,
    });

    // `assumptions` is part of the pipeline output but not stored on the report row.
    const { assumptions: _assumptions, ...report } = result;
    return reportRepository.create(report);
  },

  async getById(id: string, userId: string): Promise<InvestmentReport> {
    const report = await reportRepository.getById(id);
    if (!report) throw ApiError.notFound('Report not found');
    if (report.userId !== userId) throw ApiError.unauthorized('Not your report');
    return report;
  },

  listForUser(userId: string): Promise<InvestmentReport[]> {
    return reportRepository.listForUser(userId);
  },
};
