// ViewModel: report list + single report viewing.

import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/api/reportService';
import { QUERY_KEYS } from '../utils/constants';

export function useReportListViewModel() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.reports],
    queryFn: () => reportService.list(),
  });
  return { loading: query.isLoading, reports: query.data ?? [] };
}

export function useReportViewModel(reportId: string) {
  const query = useQuery({
    queryKey: [QUERY_KEYS.report, reportId],
    queryFn: () => reportService.getById(reportId),
    enabled: !!reportId,
  });
  return { loading: query.isLoading, report: query.data };
}
