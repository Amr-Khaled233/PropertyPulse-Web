// Add / edit property form used by the admin Property Management table.

import { useEffect, useState } from 'react';
import type { Property, PropertyType, ListingStatus } from '@propertypulse/shared-types';
import type { PropertyDraft } from '../../../services/api/adminService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

const TYPES: PropertyType[] = ['apartment', 'house', 'villa', 'townhouse', 'commercial', 'land'];
const STATUSES: ListingStatus[] = ['for_sale', 'for_rent', 'sold', 'off_market'];

interface Props {
  open: boolean;
  editing?: Property | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (draft: PropertyDraft) => Promise<unknown>;
}

const blank = {
  title: '', type: 'apartment' as PropertyType, status: 'for_sale' as ListingStatus,
  price: '', currency: 'EGP', areaSqm: '', bedrooms: '', bathrooms: '',
  city: 'Cairo', state: '', agentName: '', description: '', featured: false,
};

export function PropertyFormModal({ open, editing, saving, onClose, onSubmit }: Props) {
  const [f, setF] = useState(blank);

  useEffect(() => {
    if (editing) {
      setF({
        title: editing.title,
        type: editing.type,
        status: editing.status,
        price: String(editing.price),
        currency: editing.currency,
        areaSqm: String(editing.areaSqm),
        bedrooms: String(editing.bedrooms),
        bathrooms: String(editing.bathrooms),
        city: editing.address.city,
        state: editing.address.state ?? '',
        agentName: editing.agentName ?? '',
        description: editing.description ?? '',
        featured: editing.featured ?? false,
      });
    } else {
      setF(blank);
    }
  }, [editing, open]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function submit() {
    const draft: PropertyDraft = {
      title: f.title.trim(),
      type: f.type,
      status: f.status,
      price: Number(f.price) || 0,
      currency: f.currency || 'EGP',
      areaSqm: Number(f.areaSqm) || 0,
      bedrooms: Number(f.bedrooms) || 0,
      bathrooms: Number(f.bathrooms) || 0,
      address: { line1: f.state || f.city, city: f.city, state: f.state || undefined, country: 'Egypt' },
      images: editing?.images ?? [],
      agentName: f.agentName || undefined,
      description: f.description || undefined,
      featured: f.featured,
      approved: editing?.approved ?? true,
      source: editing?.source ?? 'admin',
    };
    await onSubmit(draft);
    onClose();
  }

  const valid = f.title.trim() && Number(f.price) > 0 && Number(f.areaSqm) > 0;

  return (
    <Modal
      open={open}
      title={editing ? 'Edit property' : 'Add property'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="green" size="sm" onClick={submit} disabled={!valid || saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add property'}
          </Button>
        </>
      }
    >
      <div className="grid grid-2" style={{ gap: 12 }}>
        <div className="field" style={{ gridColumn: 'span 2' }}>
          <label className="label">Title</label>
          <input className="input" value={f.title} onChange={set('title')} />
        </div>
        <div className="field">
          <label className="label">Type</label>
          <select className="select" value={f.type} onChange={set('type')}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label">Status</label>
          <select className="select" value={f.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label">Price (EGP)</label>
          <input className="input" type="number" value={f.price} onChange={set('price')} />
        </div>
        <div className="field">
          <label className="label">Area (m²)</label>
          <input className="input" type="number" value={f.areaSqm} onChange={set('areaSqm')} />
        </div>
        <div className="field">
          <label className="label">Bedrooms</label>
          <input className="input" type="number" value={f.bedrooms} onChange={set('bedrooms')} />
        </div>
        <div className="field">
          <label className="label">Bathrooms</label>
          <input className="input" type="number" value={f.bathrooms} onChange={set('bathrooms')} />
        </div>
        <div className="field">
          <label className="label">City</label>
          <select className="select" value={f.city} onChange={set('city')}>
            <option value="Cairo">Cairo</option>
            <option value="Giza">Giza</option>
          </select>
        </div>
        <div className="field">
          <label className="label">Area / Town</label>
          <input className="input" value={f.state} onChange={set('state')} placeholder="e.g. New Cairo City" />
        </div>
        <div className="field" style={{ gridColumn: 'span 2' }}>
          <label className="label">Agent</label>
          <input className="input" value={f.agentName} onChange={set('agentName')} />
        </div>
        <div className="field" style={{ gridColumn: 'span 2' }}>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={f.description} onChange={set('description')} />
        </div>
        <label className="center-row" style={{ gap: 8, gridColumn: 'span 2', cursor: 'pointer' }}>
          <input type="checkbox" checked={f.featured} onChange={set('featured')} />
          <span>Mark as featured</span>
        </label>
      </div>
    </Modal>
  );
}
