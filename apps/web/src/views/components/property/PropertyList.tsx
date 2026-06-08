// Responsive grid of property cards.

import type { Property } from '@propertypulse/shared-types';
import { PropertyCard } from './PropertyCard';

interface Props {
  properties: Property[];
  watchedIds?: string[];
  onToggleWatch?: (id: string) => void;
  empty?: string;
}

export function PropertyList({ properties, watchedIds = [], onToggleWatch, empty }: Props) {
  if (!properties.length) {
    return (
      <div className="card card-pad center muted" style={{ padding: '48px 24px' }}>
        {empty ?? 'No properties found.'}
      </div>
    );
  }

  return (
    <div className="grid grid-3">
      {properties.map((p) => (
        <PropertyCard
          key={p.id}
          property={p}
          watched={watchedIds.includes(p.id)}
          onToggleWatch={onToggleWatch}
        />
      ))}
    </div>
  );
}
