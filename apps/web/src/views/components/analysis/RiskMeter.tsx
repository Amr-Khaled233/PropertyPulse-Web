// Risk gauge + weighted factor breakdown.

import type { RiskAssessment } from '@propertypulse/shared-types';
import { RISK_COLORS } from '../../../utils/constants';

interface Props {
  risk: RiskAssessment;
}

export function RiskMeter({ risk }: Props) {
  const color = RISK_COLORS[risk.overall];
  return (
    <div>
      <div className="between" style={{ marginBottom: 10 }}>
        <span className="stat-label">Risk Score</span>
        <span className={`badge badge-${risk.overall}`} style={{ textTransform: 'capitalize' }}>
          {risk.overall}
        </span>
      </div>

      <div className="meter" style={{ height: 10, marginBottom: 16 }}>
        <span style={{ width: `${risk.score}%`, background: color }} />
      </div>

      <div className="col" style={{ gap: 12 }}>
        {risk.factors.map((f) => (
          <div key={f.name}>
            <div className="between" style={{ fontSize: '0.84rem' }}>
              <span>{f.name}</span>
              <span className="muted" style={{ textTransform: 'capitalize' }}>{f.level}</span>
            </div>
            <div className="meter" style={{ marginTop: 4 }}>
              <span style={{ width: `${f.weight * 100}%`, background: RISK_COLORS[f.level] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
