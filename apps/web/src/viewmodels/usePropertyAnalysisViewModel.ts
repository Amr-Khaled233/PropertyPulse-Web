// ViewModel: a single property's detail + computed investment metrics + report.

import { useQuery, useMutation } from '@tanstack/react-query';
import { propertyService } from '../services/api/propertyService';
import { analysisService } from '../services/api/analysisService';
import { reportService } from '../services/api/reportService';
import { toErrorMessage } from '../services/api/apiClient';
import { useUiStore } from '../store/uiStore';
import { QUERY_KEYS } from '../utils/constants';

export function usePropertyAnalysisViewModel(propertyId: string) {
  const lang = useUiStore((s) => s.lang);

  const property = useQuery({
    // lang is part of the key so switching language refetches the localized copy.
    queryKey: [QUERY_KEYS.property, propertyId, lang],
    queryFn: () => propertyService.getById(propertyId, lang),
    enabled: !!propertyId,
  });

  const metrics = useQuery({
    queryKey: [QUERY_KEYS.metrics, propertyId],
    queryFn: () => analysisService.computeForProperty(propertyId),
    enabled: !!propertyId,
  });

  const generateReport = useMutation({
    mutationFn: () => reportService.generate(propertyId, {}, lang),
  });

  return {
    loading: property.isLoading || metrics.isLoading,
    property: property.data,
    assumptions: metrics.data?.assumptions,
    metrics: metrics.data?.metrics,
    report: generateReport.data,
    generating: generateReport.isPending,
    // Surfaced to the View (e.g. the free-plan "limit reached" message).
    generateError: generateReport.isError ? toErrorMessage(generateReport.error) : null,
    async generateReport() {
      try {
        await generateReport.mutateAsync();
      } catch {
        /* error is exposed via generateError */
      }
    },
  };
}
