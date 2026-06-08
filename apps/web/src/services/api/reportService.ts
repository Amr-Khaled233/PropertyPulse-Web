// API calls for generating and fetching investment reports.

import type { InvestmentReport, FinancialAssumptions } from '@propertypulse/shared-types';
import { apiClient, IS_MOCK, mockDelay } from './apiClient';
import { MOCK_PROPERTIES, MOCK_REPORTS, mockReportFor } from '../mock/mockData';

export const reportService = {
  async generate(
    propertyId: string,
    _assumptions: Partial<FinancialAssumptions> = {},
    lang = 'en',
  ): Promise<InvestmentReport> {
    if (IS_MOCK) {
      const property = MOCK_PROPERTIES.find((p) => p.id === propertyId) ?? MOCK_PROPERTIES[0];
      // Slightly longer delay to mimic the multi-agent AI pipeline.
      return mockDelay(mockReportFor(property, 3), 900);
    }
    const { data } = await apiClient.post<InvestmentReport>('/reports', {
      propertyId,
      assumptions: _assumptions,
      lang,
    });
    return data;
  },

  async list(): Promise<InvestmentReport[]> {
    if (IS_MOCK) return mockDelay(MOCK_REPORTS);
    const { data } = await apiClient.get<InvestmentReport[]>('/reports');
    return data;
  },

  async getById(id: string): Promise<InvestmentReport> {
    if (IS_MOCK) {
      const found =
        MOCK_REPORTS.find((r) => r.id === id) ??
        mockReportFor(MOCK_PROPERTIES.find((p) => `report-${p.id}` === id) ?? MOCK_PROPERTIES[0]);
      return mockDelay(found);
    }
    const { data } = await apiClient.get<InvestmentReport>(`/reports/${id}`);
    return data;
  },
};
