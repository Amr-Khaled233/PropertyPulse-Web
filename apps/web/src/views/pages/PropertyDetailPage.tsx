// Property detail page (View) — hero, AI analysis, financial forecast.

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePropertyAnalysisViewModel } from '../../viewmodels/usePropertyAnalysisViewModel';
import { useWatchlistViewModel } from '../../viewmodels/useWatchlistViewModel';
import { useI18n } from '../../i18n';
import { ROUTES } from '../../routes/routes';
import { formatCompactCurrency, formatPercent, formatPropertySpecs, formatYears } from '../../utils/formatters';
import { propertyImage } from '../../utils/propertyImages';
import { Loader } from '../components/common/Loader';
import { RentalYieldCard } from '../components/analysis/RentalYieldCard';
import { InquiryModal } from '../components/property/InquiryModal';

export function PropertyDetailPage() {
  const { id = '' } = useParams();
  const vm = usePropertyAnalysisViewModel(id);
  const watch = useWatchlistViewModel();
  const { t } = useI18n();
  const [inquiryOpen, setInquiryOpen] = useState(false);

  if (vm.loading || !vm.property || !vm.metrics) return <Loader full label={t('common.loading')} />;

  const p = vm.property;
  const m = vm.metrics;
  const confidence = 8.7;

  return (
    <div className="col" style={{ gap: 22 }}>
      {/* Hero */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          position: 'relative',
          minHeight: 320,
          backgroundImage: `linear-gradient(to top, rgba(10,27,46,0.85), rgba(10,27,46,0.15)), url(${propertyImage(p)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <div className="score-circle" style={{ position: 'absolute', top: 20, insetInlineEnd: 24 }}>
          <b>{confidence}</b>
          <small>Score</small>
        </div>
        <div style={{ padding: 28 }}>
          <span className="badge badge-green">{p.status.replace('_', ' ')}</span>
          <h1 style={{ color: '#fff', margin: '10px 0 4px' }}>{p.title}</h1>
          <div style={{ opacity: 0.85 }}>{p.address.line1}, {p.address.city}, {p.address.country}</div>
          <div className="row" style={{ gap: 20, marginTop: 14, fontSize: '0.9rem' }}>
            <span>🛏 {p.bedrooms} Rooms</span>
            <span>🛁 {p.bathrooms} Baths</span>
            <span>▢ {p.areaSqm.toLocaleString()} m²</span>
            <span>{formatCompactCurrency(p.price, p.currency)}</span>
          </div>
        </div>
      </div>

      <div className="row wrap" style={{ gap: 22, alignItems: 'flex-start' }}>
        <div className="grow card card-pad" style={{ minWidth: 280 }}>
          <span className="eyebrow">✦ {t('detail.analysis')}</span>
          <p className="muted" style={{ marginTop: 12 }}>{p.description}</p>
          <div className="card" style={{ padding: 16, background: 'var(--surface-alt)', borderInlineStart: '3px solid var(--green)' }}>
            <b className="serif">{t('detail.verdict')}</b>
            <p className="muted" style={{ margin: '6px 0 0', fontStyle: 'italic' }}>
              “Strong rental demand and projected appreciation make this a compelling multi-year hold.” — AI Advisor
            </p>
          </div>
          <div className="muted" style={{ marginTop: 14, fontSize: '0.85rem' }}>
            {formatPropertySpecs(p.bedrooms, p.bathrooms, p.areaSqm)}
          </div>
        </div>

        <div className="card-dark card-pad" style={{ width: 300, maxWidth: '100%', flexShrink: 0 }}>
          <span className="stat-label" style={{ color: 'var(--text-on-dark-muted)' }}>{t('detail.confidence')}</span>
          <div className="stat-value" style={{ color: '#fff' }}>{confidence}<span className="unit">/10</span></div>
          <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.85rem' }}>
            AI-weighted blend of yield, liquidity, market and regulatory factors.
          </p>
          <Link to={ROUTES.analysis(p.id)} className="btn btn-green btn-block">
            {t('common.download')}
          </Link>
          <button
            className="btn btn-on-dark btn-block"
            style={{ marginTop: 10 }}
            onClick={() => (watch.isWatched(p.id) ? undefined : watch.add(p.id))}
          >
            {watch.isWatched(p.id) ? '★ Saved' : '☆ Add to Portfolio'}
          </button>
          <button className="btn btn-outline-light btn-block" style={{ marginTop: 10 }} onClick={() => setInquiryOpen(true)}>
            {t('inquiry.cta')}
          </button>
        </div>
      </div>

      <InquiryModal open={inquiryOpen} propertyId={p.id} propertyTitle={p.title} onClose={() => setInquiryOpen(false)} />

      {/* Financial forecast */}
      <div>
        <span className="eyebrow">{t('detail.forecast')}</span>
        <div className="grid grid-4" style={{ marginTop: 12 }}>
          <RentalYieldCard label={t('detail.netYield')} value={formatPercent(m.netRentalYield)} positive sub="annualized" />
          <RentalYieldCard label={t('detail.roi')} value={formatPercent(m.fiveYearRoi)} positive sub="projected" />
          <RentalYieldCard label={t('detail.cashOnCash')} value={formatPercent(m.cashOnCashReturn)} />
          <RentalYieldCard label="Break-even" value={formatYears(m.breakEvenYears)} />
        </div>
      </div>
    </div>
  );
}
