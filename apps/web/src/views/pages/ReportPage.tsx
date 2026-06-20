// Reports page (View) — list of generated reports + single report viewer.

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReportListViewModel, useReportViewModel, useComparisonsViewModel } from '../../viewmodels/useReportViewModel';
import { useI18n } from '../../i18n';
import { ROUTES } from '../../routes/routes';
import { RECOMMENDATION_LABELS, RECOMMENDATION_COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { Loader } from '../components/common/Loader';
import { ReportViewer } from '../components/report/ReportViewer';
import { CompareResult } from '../components/property/CompareResult';
import { Button } from '../components/common/Button';

function ReportList() {
  const { loading, reports, deleteReport } = useReportListViewModel();
  const { t } = useI18n();

  if (loading) return <Loader full />;
  if (!reports.length) return <div className="card card-pad muted center">{t('reports.empty')}</div>;

  return (
    <div className="grid grid-2">
      {reports.map((r) => (
        <div key={r.id} className="card card-pad card-hover">
          <div className="between">
            <span className="badge" style={{ background: RECOMMENDATION_COLORS[r.recommendation], color: '#fff' }}>
              {RECOMMENDATION_LABELS[r.recommendation]}
            </span>
            <div className="center-row" style={{ gap: 8 }}>
              <span className="muted" style={{ fontSize: '0.8rem' }}>{formatDate(r.generatedAt)}</span>
              <button
                className="icon-btn icon-btn-sm danger"
                title={t('reports.delete')}
                onClick={() => { if (confirm(t('reports.deleteConfirm'))) deleteReport(r.id); }}
              >🗑</button>
            </div>
          </div>
          <Link to={ROUTES.report(r.id)} style={{ display: 'block', color: 'inherit' }}>
            <p className="muted" style={{ marginTop: 12, marginBottom: 8 }}>{r.summary}</p>
            <span className="muted" style={{ fontSize: '0.82rem' }}>
              {t('reports.confidence')}: {Math.round(r.confidence * 100)}%
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}

function ComparisonList() {
  const { loading, comparisons, deleteComparison } = useComparisonsViewModel();
  const { t } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);

  if (loading || !comparisons.length) return null; // hide the section until there's something to show

  return (
    <div className="col" style={{ gap: 12, marginTop: 10 }}>
      <h3 style={{ margin: 0 }}>{t('reports.comparisons')}</h3>
      {comparisons.map((c) => {
        const open = openId === c.id;
        return (
          <div key={c.id} className="card card-pad">
            <div className="between" style={{ gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <b className="serif truncate" style={{ display: 'block' }}>
                  {c.result.verdict || `${c.result.candidates.length} ✕`}
                </b>
                <span className="muted" style={{ fontSize: '0.8rem' }}>{formatDate(c.createdAt)}</span>
              </div>
              <div className="center-row" style={{ gap: 8, flexShrink: 0 }}>
                <Button variant="outline" size="sm" onClick={() => setOpenId(open ? null : c.id)}>
                  {t('reports.viewComparison')}
                </Button>
                <button
                  className="icon-btn icon-btn-sm danger"
                  title={t('reports.delete')}
                  onClick={() => { if (confirm(t('reports.comparisonDeleteConfirm'))) deleteComparison(c.id); }}
                >🗑</button>
              </div>
            </div>
            {open && <div style={{ marginTop: 14 }}><CompareResult result={c.result} /></div>}
          </div>
        );
      })}
    </div>
  );
}

function SingleReport({ id }: { id: string }) {
  const { loading, report } = useReportViewModel(id);
  if (loading || !report) return <Loader full />;
  return (
    <div className="col" style={{ gap: 16 }}>
      <Link to={ROUTES.reports} className="accent">‹ Back to reports</Link>
      <ReportViewer report={report} />
    </div>
  );
}

export function ReportPage() {
  const { id } = useParams();
  const { t } = useI18n();
  return (
    <div className="col" style={{ gap: 18 }}>
      {!id && <h2 style={{ margin: 0 }}>{t('reports.title')}</h2>}
      {id ? <SingleReport id={id} /> : (<><ReportList /><ComparisonList /></>)}
    </div>
  );
}
