// API calls for generating and fetching investment reports.

import type { InvestmentReport, FinancialAssumptions } from '@propertypulse/shared-types';
import { apiClient } from './apiClient';

export const reportService = {
  async generate(
    propertyId: string,
    assumptions: Partial<FinancialAssumptions> = {},
    lang = 'en',
  ): Promise<InvestmentReport> {
    const { data } = await apiClient.post<InvestmentReport>('/reports', { propertyId, assumptions, lang });
    return data;
  },

  async list(): Promise<InvestmentReport[]> {
    const { data } = await apiClient.get<InvestmentReport[]>('/reports');
    return data;
  },

  async getById(id: string): Promise<InvestmentReport> {
    const { data } = await apiClient.get<InvestmentReport>(`/reports/${id}`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/reports/${id}`);
  },
};
