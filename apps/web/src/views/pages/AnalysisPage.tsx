// Investment analysis page (View) — computed metrics + on-demand AI report.

import { useParams, Link } from 'react-router-dom';
import { usePropertyAnalysisViewModel } from '../../viewmodels/usePropertyAnalysisViewModel';
import { useI18n } from '../../i18n';
import { ROUTES } from '../../routes/routes';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';
import { ReportViewer } from '../components/report/ReportViewer';
import { NegotiationCard } from '../components/analysis/NegotiationCard';
import { ScenarioPanel } from '../components/analysis/ScenarioPanel';

export function AnalysisPage() {
  const { id = '' } = useParams();
  const vm = usePropertyAnalysisViewModel(id);
  const { t } = useI18n();

  if (vm.loading || !vm.property) return <Loader full label={t('common.loading')} />;

  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="between wrap" style={{ gap: 12 }}>
        <div>
          <span className="eyebrow">{t('detail.analysis')}</span>
          <h2 style={{ margin: '4px 0 0' }}>{vm.property.title}</h2>
        </div>
        {!vm.report && (
          <Button variant="green" onClick={() => vm.generateReport()} disabled={vm.generating}>
            {vm.generating ? t('detail.generating') : t('detail.generate')}
          </Button>
        )}
      </div>

      {vm.generateError && (
        <div className="card card-pad" style={{ borderInlineStart: '3px solid var(--orange)' }}>
          <b className="serif">{vm.generateError}</b>
          <div style={{ marginTop: 12 }}>
            <Link to={ROUTES.pricing} className="btn btn-green btn-sm">{t('pricing.upgradeNow')}</Link>
          </div>
        </div>
      )}

      {vm.generating && <Loader label={t('detail.generating')} />}

      {vm.report ? (
        <ReportViewer report={vm.report} />
      ) : (
        !vm.generating && (
          <div className="card card-pad muted center" style={{ padding: '32px 24px' }}>
            Generate an AI report to see the full ROI projection, risk assessment and market trends.
          </div>
        )
      )}

      {/* Always-available, data-grounded tools (no AI quota needed) */}
      <NegotiationCard propertyId={vm.property.id} />
      <ScenarioPanel price={vm.property.price} currency={vm.property.currency} areaSqm={vm.property.areaSqm} type={vm.property.type} />
    </div>
  );
}
