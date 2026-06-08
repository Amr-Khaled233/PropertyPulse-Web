// Public landing / marketing page (View).

import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { ROUTES } from '../../routes/routes';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const FEATURES = [
  { icon: '◭', title: 'Predictive Modeling', desc: 'Forecast price and rent trajectories with market-trained models.' },
  { icon: '⬡', title: 'Neural Graph Analysis', desc: 'Map relationships between districts, demand and liquidity.' },
  { icon: '⚖', title: 'Institutional Risk Engine', desc: 'Weighted risk scoring across market, regulatory and liquidity factors.' },
  { icon: '⚡', title: 'Real-time Liquidity', desc: 'Track resale velocity and absorption per corridor.' },
  { icon: '%', title: 'Tax Optimization', desc: 'Model net returns after financing, vacancy and costs.' },
  { icon: '◰', title: 'Market Resistance', desc: 'Stress-test assets against volatility and rate shifts.' },
];

const ENGINES = [
  { tag: 'Generative LLM', title: 'Reasoning & Reports', desc: 'Investment reasoning, risk narratives and grounded Q&A.' },
  { tag: 'Vector RAG', title: 'Grounded Retrieval', desc: 'Listings, rental stats, neighborhoods and regulations on demand.' },
  { tag: 'Autonomous Agents', title: 'Orchestrated Analysis', desc: 'Agents gather data, run calculations and monitor your portfolio.' },
];

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="container">
      <Navbar />

      {/* Hero */}
      <section className="hero" style={{ marginTop: 8 }}>
        <span className="eyebrow" style={{ color: 'var(--green)' }}>{t('landing.heroPre')}</span>
        <h1 style={{ marginTop: 14 }}>
          {t('landing.heroTitle')} <span className="serif italic accent">{t('landing.heroHighlight')}</span>
        </h1>
        <p>{t('landing.heroSub')}</p>
        <div className="row wrap" style={{ gap: 12, marginTop: 24 }}>
          <Link to={ROUTES.register} className="btn btn-green btn-lg">{t('landing.startAnalysis')}</Link>
          <Link to={ROUTES.dashboard} className="btn btn-on-dark btn-lg">{t('landing.viewDemo')}</Link>
        </div>

        <div
          className="card"
          style={{ position: 'absolute', top: 40, insetInlineEnd: 40, width: 220, padding: 18 }}
        >
          <div className="between">
            <div>
              <div style={{ fontWeight: 600 }}>Skyline Heights</div>
              <div className="muted" style={{ fontSize: '0.78rem' }}>New Cairo</div>
            </div>
            <span className="badge badge-green">9.4</span>
          </div>
          <div className="muted" style={{ fontSize: '0.78rem', marginTop: 10 }}>High Growth Probability</div>
          <div className="meter" style={{ marginTop: 6 }}><span style={{ width: '88%' }} /></div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="grid grid-3 center">
          <div>
            <div className="stat-value accent">12K+</div>
            <div className="muted">Properties Analyzed</div>
          </div>
          <div>
            <div className="stat-value accent">15.4%</div>
            <div className="muted">Avg. Identified ROI</div>
          </div>
          <div>
            <div className="stat-value accent">EGP 4B+</div>
            <div className="muted">Assets Under Analysis</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="insights">
        <h2 className="center">{t('landing.infraTitle')}</h2>
        <div className="grid grid-3" style={{ marginTop: 28 }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-pad card-hover">
              <span style={{ fontSize: '1.5rem', color: 'var(--green)' }}>{f.icon}</span>
              <h3 style={{ margin: '10px 0 6px' }}>{f.title}</h3>
              <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Engines */}
      <section className="section" id="engines">
        <h2 className="center">{t('landing.enginesTitle')}</h2>
        <div className="grid grid-3" style={{ marginTop: 28 }}>
          {ENGINES.map((e, i) => (
            <div key={e.tag} className={i === 1 ? 'card-dark card-pad' : 'card card-pad'}>
              <span className="badge badge-green">{e.tag}</span>
              <h3 style={{ margin: '12px 0 6px', color: i === 1 ? '#fff' : undefined }}>{e.title}</h3>
              <p className={i === 1 ? '' : 'muted'} style={{ margin: 0, fontSize: '0.9rem', color: i === 1 ? 'var(--text-on-dark-muted)' : undefined }}>
                {e.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
