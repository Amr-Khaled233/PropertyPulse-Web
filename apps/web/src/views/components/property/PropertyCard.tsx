// Property summary card with image, price and key specs.

import { Link } from 'react-router-dom';
import type { Property } from '@propertypulse/shared-types';
import { ROUTES } from '../../../routes/routes';
import { formatCompactCurrency, formatPropertySpecs } from '../../../utils/formatters';
import { propertyImage } from '../../../utils/propertyImages';

interface Props {
  property: Property;
  watched?: boolean;
  onToggleWatch?: (id: string) => void;
}

export function PropertyCard({ property, watched, onToggleWatch }: Props) {
  return (
    <div className="card card-hover" style={{ overflow: 'hidden', padding: 0 }}>
      <Link to={ROUTES.property(property.id)} style={{ display: 'block' }}>
        <div
          style={{
            height: 168,
            backgroundImage: `url(${propertyImage(property)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'var(--navy)',
            position: 'relative',
          }}
        >
          <span className="badge badge-navy" style={{ position: 'absolute', top: 12, insetInlineStart: 12 }}>
            {property.type}
          </span>
        </div>
      </Link>

      <div style={{ padding: 16 }}>
        <div className="between">
          <strong className="serif" style={{ fontSize: '1.05rem' }}>
            {formatCompactCurrency(property.price, property.currency)}
          </strong>
          {onToggleWatch && (
            <button
              className="icon-btn"
              style={{ width: 32, height: 32, color: watched ? 'var(--orange)' : 'var(--text-muted)' }}
              onClick={() => onToggleWatch(property.id)}
              aria-label="Toggle watchlist"
            >
              {watched ? '★' : '☆'}
            </button>
          )}
        </div>
        <Link to={ROUTES.property(property.id)}>
          <div style={{ fontWeight: 600, marginTop: 4 }}>{property.title}</div>
        </Link>
        <div className="muted" style={{ fontSize: '0.84rem', marginTop: 2 }}>
          {[property.address.state, property.address.city].filter(Boolean).join(' · ')}
        </div>
        <div className="muted" style={{ fontSize: '0.82rem', marginTop: 10 }}>
          {formatPropertySpecs(property.bedrooms, property.bathrooms, property.areaSqm)}
        </div>
      </div>
    </div>
  );
}
