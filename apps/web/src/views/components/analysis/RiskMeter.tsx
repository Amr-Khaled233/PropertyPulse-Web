// Risk gauge + weighted factor breakdown.

import type { RiskAssessment, RiskLevel } from '@propertypulse/shared-types';
import { RISK_COLORS } from '../../../utils/constants';
import { useI18n, type TranslationKey } from '../../../i18n';

interface Props {
  risk: RiskAssessment;
}

export function RiskMeter({ risk }: Props) {
  const { t } = useI18n();
  const color = RISK_COLORS[risk.overall];
  const lvl = (level: RiskLevel) => t(`report.risk.${level}` as TranslationKey);
  return (
    <div>
      <div className="between" style={{ marginBottom: 10 }}>
        <span className="stat-label">{t('report.riskScore')}</span>
        <span className={`badge badge-${risk.overall}`}>{lvl(risk.overall)}</span>
      </div>

      <div className="meter" style={{ height: 10, marginBottom: 16 }}>
        <span style={{ width: `${risk.score}%`, background: color }} />
      </div>

      <div className="col" style={{ gap: 12 }}>
        {risk.factors.map((f) => (
          <div key={f.name}>
            <div className="between" style={{ fontSize: '0.84rem' }}>
              <span>{f.name}</span>
              <span className="muted">{lvl(f.level)}</span>
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
