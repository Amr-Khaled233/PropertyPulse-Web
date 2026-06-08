// Page navigator: arrow buttons + numbered window + a "jump to page" input.

import { useState } from 'react';
import { useI18n } from '../../../i18n';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}

/** Build a compact page list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 132. */
function pageWindow(current: number, last: number): (number | '…')[] {
  const out: (number | '…')[] = [];
  const around = 1;
  for (let p = 1; p <= last; p++) {
    if (p === 1 || p === last || (p >= current - around && p <= current + around)) {
      out.push(p);
    } else if (out[out.length - 1] !== '…') {
      out.push('…');
    }
  }
  return out;
}

export function Pagination({ page, pageSize, total, onPage }: Props) {
  const { t } = useI18n();
  const [jump, setJump] = useState('');
  const last = Math.max(1, Math.ceil(total / pageSize));
  if (last <= 1) return null;

  const go = (p: number) => {
    const next = Math.min(Math.max(1, p), last);
    if (next !== page) {
      onPage(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submitJump = () => {
    const n = Number(jump);
    if (Number.isFinite(n) && n >= 1) go(Math.trunc(n));
    setJump('');
  };

  return (
    <nav className="pager" aria-label="Pagination">
      <button className="pager-btn" onClick={() => go(page - 1)} disabled={page <= 1} aria-label={t('pager.prev')}>
        ‹
      </button>

      <div className="pager-nums">
        {pageWindow(page, last).map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="pager-gap">…</span>
          ) : (
            <button
              key={p}
              className={`pager-num${p === page ? ' active' : ''}`}
              onClick={() => go(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button className="pager-btn" onClick={() => go(page + 1)} disabled={page >= last} aria-label={t('pager.next')}>
        ›
      </button>

      <div className="pager-jump">
        <input
          className="input"
          type="number"
          min={1}
          max={last}
          placeholder={t('pager.goTo')}
          value={jump}
          onChange={(e) => setJump(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submitJump(); }}
        />
        <button className="pager-btn" onClick={submitJump} disabled={!jump}>{t('pager.go')}</button>
      </div>

      <span className="pager-info muted">
        {t('pager.page')} {page} {t('pager.of')} {last}
      </span>
    </nav>
  );
}
