// AI Negotiation Tips — suggests a fair value + opening offer grounded in real
// comparable listings, fetched on demand.

import { useMutation } from '@tanstack/react-query';
import { analysisService } from '../../../services/api/analysisService';
import { useUiStore } from '../../../store/uiStore';
import { useI18n } from '../../../i18n';
import { formatCompactCurrency } from '../../../utils/formatters';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import { Markdown } from '../common/Markdown';

export function NegotiationCard({ propertyId }: { propertyId: string }) {
  const { t } = useI18n();
  const lang = useUiStore((s) => s.lang);
  const m = useMutation({ mutationFn: () => analysisService.negotiation(propertyId, lang) });
  const r = m.data;

  return (
    <div className="card card-pad">
      <div className="between wrap" style={{ gap: 10 }}>
        <div>
          <span className="eyebrow">🤝 {t('negotiate.eyebrow')}</span>
          <h3 style={{ margin: '4px 0 0' }}>{t('negotiate.title')}</h3>
        </div>
        {!r && (
          <Button variant="green" size="sm" onClick={() => m.mutate()} disabled={m.isPending}>
            {m.isPending ? t('negotiate.analyzing') : t('negotiate.cta')}
          </Button>
        )}
      </div>

      {m.isPending && <div style={{ marginTop: 16 }}><Loader label={t('negotiate.analyzing')} /></div>}

      {r && (
        <div className="col" style={{ gap: 14, marginTop: 14 }}>
          <div className="grid grid-3" style={{ gap: 12 }}>
            <Stat label={t('negotiate.asking')} value={formatCompactCurrency(r.askingPrice, r.currency)} />
            <Stat
              label={t('negotiate.fairValue')}
              value={formatCompactCurrency(r.fairValue, r.currency)}
              sub={`${r.deltaPct > 0 ? '+' : ''}${r.deltaPct}% ${t('negotiate.vsMarket')}`}
              subColor={r.deltaPct > 3 ? 'var(--orange)' : r.deltaPct < -3 ? 'var(--green)' : 'var(--text-muted)'}
            />
            <Stat label={t('negotiate.suggestedOffer')} value={formatCompactCurrency(r.suggestedOffer, r.currency)} highlight />
          </div>

          {r.summary && (
            <div className="card" style={{ padding: 14, background: 'var(--surface-alt)', borderInlineStart: '3px solid var(--green)' }}>
              <Markdown text={r.summary} />
            </div>
          )}

          <ul className="negotiate-tips">
            {r.tips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
          <div className="muted" style={{ fontSize: '0.78rem' }}>
            {t('negotiate.basedOn').replace('{n}', String(r.compCount))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub, subColor, highlight }: { label: string; value: string; sub?: string; subColor?: string; highlight?: boolean }) {
  return (
    <div className="card" style={{ padding: 14, ...(highlight ? { background: 'var(--navy)', color: '#fff' } : {}) }}>
      <div className="stat-label" style={highlight ? { color: 'rgba(255,255,255,0.7)' } : {}}>{label}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-head)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.8rem', marginTop: 2, color: highlight ? 'rgba(255,255,255,0.8)' : subColor }}>{sub}</div>}
    </div>
  );
}
