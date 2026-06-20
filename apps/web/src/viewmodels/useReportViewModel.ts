// ViewModel: report list + single report viewing.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '../services/api/reportService';
import { useUiStore } from '../store/uiStore';
import { toErrorMessage } from '../services/api/apiClient';
import { QUERY_KEYS } from '../utils/constants';

export function useReportListViewModel() {
  const qc = useQueryClient();
  const pushToast = useUiStore((s) => s.pushToast);
  const query = useQuery({
    queryKey: [QUERY_KEYS.reports],
    queryFn: () => reportService.list(),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => reportService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.reports] }); pushToast('Report deleted.', 'success'); },
    onError: (e) => pushToast(toErrorMessage(e), 'error'),
  });

  return {
    loading: query.isLoading,
    reports: query.data ?? [],
    deleteReport: (id: string) => deleteMut.mutate(id),
  };
}

export function useReportViewModel(reportId: string) {
  const query = useQuery({
    queryKey: [QUERY_KEYS.report, reportId],
    queryFn: () => reportService.getById(reportId),
    enabled: !!reportId,
  });
  return { loading: query.isLoading, report: query.data };
}
