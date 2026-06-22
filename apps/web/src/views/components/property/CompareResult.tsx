// AI Compare results — matches the PropertyPulse mobile app exactly:
// an "AI VERDICT" card, then candidate cards sorted by ranking (rank 1 first,
// highlighted), each with a rank badge, recommendation pill, price, 4 metrics,
// an investment-score line, and the AI rationale.

import type { ComparisonResult, ComparisonCandidate } from '../../../services/api/analysisService';
import { useI18n, type TranslationKey } from '../../../i18n';

// Mobile theme tokens (kept exact so Web & Mobile never disagree).
const EMERALD = '#0B9972';
const NAVY = '#0A1628';
const REC_COLOR: Record<string, string> = { buy: '#0B9972', hold: '#D4850A', avoid: '#C0392B' };

/** Compact currency the mobile way: "16.0M EGP", "850K EGP". */
function compactMoney(value: number, currency = 'EGP'): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ${currency}`;
  if (abs >= 1000) return `${Math.round(value / 1000)}K ${currency}`;
  return `${Math.round(value)} ${currency}`;
}
const pct = (v: number): string => `${v.toFixed(1)}%`;

const FULL_UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
// Matches the parenthesised short form the AI produces: (ee7977ed)
const SHORT_UUID_PARENS_RE = /\(([0-9a-f]{8})\)/gi;

/** Replace any property UUIDs (full or shortened) in text with their titles. */
function sanitize(text: string, candidates: ComparisonResult['candidates']): string {
  const idToTitle = new Map<string, string>();
  for (const c of candidates) {
    const id = c.property.id.toLowerCase();
    idToTitle.set(id, c.property.title);
    idToTitle.set(id.slice(0, 8), c.property.title);
  }
  // Replace full UUIDs first
  let out = text.replace(FULL_UUID_RE, (m) => idToTitle.get(m.toLowerCase()) ?? '');
  // Replace (xxxxxxxx) short form — drop the parens, use title or empty string
  out = out.replace(SHORT_UUID_PARENS_RE, (_, hex) => idToTitle.get(hex.toLowerCase()) ?? '');
  return out;
}

export function CompareResult({ result }: { result: ComparisonResult }) {
  const { t } = useI18n();

  // Order candidates by ranking (rank 1 = best). Fall back to score if a
  // ranking entry is missing.
  const rankOf = (id: string) => result.ranking.find((r) => r.propertyId === id)?.rank;
  const ordered = [...result.candidates].sort((a, b) => {
    const ra = rankOf(a.property.id) ?? 999;
    const rb = rankOf(b.property.id) ?? 999;
    if (ra !== rb) return ra - rb;
    return b.score - a.score;
  });
  const rationaleOf = (id: string) => {
    const raw = result.ranking.find((r) => r.propertyId === id)?.rationale;
    return raw ? sanitize(raw, result.candidates) : undefined;
  };

  return (
    <div className="col" style={{ gap: 14 }}>
      {/* 1) AI VERDICT card */}
      {result.verdict && (
        <div className="cmp-verdict" style={{ background: NAVY }}>
          <span className="cmp-verdict-eyebrow" style={{ color: EMERALD }}>{t('compare.verdict')}</span>
          <p className="cmp-verdict-text">{sanitize(result.verdict, result.candidates)}</p>
        </div>
      )}

      {/* 2) Candidate cards, ranked */}
      {ordered.map((c, i) => {
        const rank = rankOf(c.property.id) ?? i + 1;
        return <CandidateCard key={c.property.id} c={c} rank={rank} rationale={rationaleOf(c.property.id)} />;
      })}
    </div>
  );
}

function CandidateCard({ c, rank, rationale }: { c: ComparisonCandidate; rank: number; rationale?: string }) {
  const { t } = useI18n();
  const isBest = rank === 1;
  const recColor = REC_COLOR[c.recommendation] ?? EMERALD;
  const below = c.pricePositionPct < 0;
  const scoreLine = t('compare.scoreLine')
    .replace('{score}', String(c.score))
    .replace('{pct}', Math.abs(c.pricePositionPct).toFixed(0))
    .replace('{dir}', below ? t('compare.below') : t('compare.above'));

  return (
    <div className="card card-pad cmp-card" style={isBest ? { border: `1.5px solid ${EMERALD}` } : undefined}>
      {/* header: rank badge + title + recommendation pill */}
      <div className="cmp-head">
        <span className="cmp-rank" style={isBest ? { background: EMERALD, color: '#fff' } : undefined}>{rank}</span>
        <strong className="cmp-title truncate">{c.property.title}</strong>
        <span className="cmp-pill" style={{ background: recColor }}>{t(`compare.rec.${c.recommendation}` as TranslationKey)}</span>
      </div>

      {/* price */}
      <div className="cmp-price serif" style={{ color: EMERALD }}>{compactMoney(c.property.price, c.property.currency)}</div>

      {/* 4 metric cells */}
      <div className="cmp-metrics">
        <Metric label={t('compare.netYield')} value={pct(c.metrics.netRentalYield)} />
        <Metric label={t('compare.roi')} value={pct(c.metrics.fiveYearRoi)} />
        <Metric label={t('compare.cashOnCash')} value={pct(c.metrics.cashOnCashReturn)} />
        <Metric label={t('compare.pricePerSqm')} value={compactMoney(c.pricePerSqm, c.property.currency)} />
      </div>

      {/* investment score line */}
      <div className="cmp-score muted">{scoreLine}</div>

      {/* AI Reasoning — per-candidate bullets (mirrors the mobile app) */}
      {c.reasoning?.length > 0 && (
        <div className="cmp-reasoning">
          <div className="cmp-reasoning-head" style={{ color: EMERALD }}>💡 {t('compare.reasoning')}</div>
          <ul className="cmp-reasoning-list">
            {c.reasoning.map((line, idx) => (
              <li key={idx}><span className="cmp-bullet" style={{ background: EMERALD }} />{line}</li>
            ))}
          </ul>
        </div>
      )}

      {/* AI ranking rationale */}
      {rationale && <div className="cmp-rationale muted">{rationale}</div>}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="cmp-metric">
      <div className="cmp-metric-label">{label}</div>
      <div className="cmp-metric-value">{value}</div>
    </div>
  );
}
