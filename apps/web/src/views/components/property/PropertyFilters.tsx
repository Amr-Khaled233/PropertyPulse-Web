// Search filter controls (city, town/area, type, price range, beds).

import type { PropertySearchParams } from '../../../types';
import { PROPERTY_TYPES } from '../../../utils/constants';
import { useI18n } from '../../../i18n';

interface Props {
  filters: PropertySearchParams;
  towns: string[];
  onChange: (patch: Partial<PropertySearchParams>) => void;
  onReset: () => void;
}

const CITIES = ['Cairo', 'Giza'];

export function PropertyFilters({ filters, towns, onChange, onReset }: Props) {
  const { t } = useI18n();
  const num = (v: string) => (v === '' ? undefined : Number(v));

  return (
    <div className="card card-pad">
      <div className="grid grid-4" style={{ gap: 12, alignItems: 'end' }}>
        <div className="field">
          <label className="label">{t('search.city')}</label>
          <select
            className="select"
            value={filters.city ?? ''}
            onChange={(e) => onChange({ city: e.target.value || undefined })}
          >
            <option value="">{t('search.allCities')}</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label">{t('search.area')}</label>
          <select
            className="select"
            value={filters.district ?? ''}
            onChange={(e) => onChange({ district: e.target.value || undefined })}
            disabled={towns.length === 0}
          >
            <option value="">{t('search.allAreas')}</option>
            {towns.map((town) => (
              <option key={town} value={town}>{town}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label">{t('search.type')}</label>
          <select
            className="select"
            value={filters.type ?? ''}
            onChange={(e) => onChange({ type: (e.target.value || undefined) as PropertySearchParams['type'] })}
          >
            <option value="">All</option>
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>{pt.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label">{t('search.beds')}</label>
          <select
            className="select"
            value={filters.bedrooms ?? ''}
            onChange={(e) => onChange({ bedrooms: num(e.target.value) })}
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((b) => (
              <option key={b} value={b}>{b}+</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label">{t('search.minPrice')}</label>
          <input className="input" type="number" value={filters.minPrice ?? ''} onChange={(e) => onChange({ minPrice: num(e.target.value) })} />
        </div>

        <div className="field">
          <label className="label">{t('search.maxPrice')}</label>
          <input className="input" type="number" value={filters.maxPrice ?? ''} onChange={(e) => onChange({ maxPrice: num(e.target.value) })} />
        </div>

        <button className="btn btn-outline" onClick={onReset} style={{ gridColumn: 'span 2' }}>
          {t('search.reset')}
        </button>
      </div>
    </div>
  );
}
