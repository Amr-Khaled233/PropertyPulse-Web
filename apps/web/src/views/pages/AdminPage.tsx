// Admin console (View) — restricted to admin accounts.
// Property Management (CRUD + moderation), CRM inquiries, and users overview.

import { useState } from 'react';
import type { Property, ListingStatus, InquiryStatus, Inquiry } from '@propertypulse/shared-types';
import { useAdminViewModel } from '../../viewmodels/useAdminViewModel';
import { formatCompactCurrency, formatDate } from '../../utils/formatters';
import { propertyImage } from '../../utils/propertyImages';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { Pagination } from '../components/common/Pagination';
import { PropertyFormModal } from '../components/admin/PropertyFormModal';

type Tab = 'properties' | 'inquiries' | 'users';

const STATUS_META: Record<ListingStatus, { label: string; color: string }> = {
  for_sale: { label: 'Available', color: 'var(--green)' },
  for_rent: { label: 'Rented', color: '#2563eb' },
  sold: { label: 'Sold', color: 'var(--text-muted)' },
  off_market: { label: 'Pending', color: 'var(--orange)' },
};

const KIND_LABEL: Record<Inquiry['kind'], string> = {
  buyer_inquiry: 'Buyer inquiry',
  viewing_request: 'Viewing request',
  contact_message: 'Contact message',
  application: 'Application',
};

const INQUIRY_STATUSES: InquiryStatus[] = ['new', 'in_progress', 'closed'];

export function AdminPage() {
  const vm = useAdminViewModel();
  const [tab, setTab] = useState<Tab>('properties');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Property) => { setEditing(p); setModalOpen(true); };

  const stats = [
    { icon: '🏢', label: 'Listings', value: vm.total.toLocaleString() },
    { icon: '👥', label: 'Users', value: vm.users.length.toLocaleString() },
    { icon: '✉️', label: 'Open inquiries', value: String(vm.inquiries.filter((i) => i.status !== 'closed').length) },
    { icon: '⭐', label: 'Featured (page)', value: String(vm.properties.filter((p) => p.featured).length) },
  ];

  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="page-header">
        <div>
          <span className="eyebrow">Admin Console</span>
          <h1 style={{ margin: '4px 0 0' }}>Management Dashboard</h1>
        </div>
        {tab === 'properties' && (
          <Button variant="green" size="sm" onClick={openAdd}>+ Add property</Button>
        )}
      </div>

      <div className="grid grid-4">
        {stats.map((s) => (
          <div key={s.label} className="card stat">
            <div className="stat-ico">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {(['properties', 'inquiries', 'users'] as Tab[]).map((tk) => (
          <button key={tk} className={`tab${tab === tk ? ' active' : ''}`} onClick={() => setTab(tk)}>
            {tk === 'properties' ? 'Property Management' : tk === 'inquiries' ? 'Inquiries (CRM)' : 'Users'}
          </button>
        ))}
      </div>

      {tab === 'properties' && (
        <div className="card card-pad">
          {vm.loadingProps ? (
            <Loader label="Loading properties…" />
          ) : (
            <>
              <div className="table-scroll">
                <table className="table admin-table">
                  <thead>
                    <tr>
                      <th></th><th>Title</th><th>Price</th><th>Location</th>
                      <th>Type</th><th>Status</th><th>Featured</th><th>Added</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vm.properties.map((p) => (
                      <tr key={p.id}>
                        <td><div className="thumb" style={{ backgroundImage: `url(${propertyImage(p)})` }} /></td>
                        <td>
                          <strong className="truncate" style={{ display: 'block', maxWidth: 220 }}>{p.title}</strong>
                          <small className="muted">{p.agentName ?? '—'}</small>
                        </td>
                        <td>{formatCompactCurrency(p.price, p.currency)}</td>
                        <td className="muted">{[p.address.state, p.address.city].filter(Boolean).join(' · ')}</td>
                        <td><span className="badge badge-soft">{p.type}</span></td>
                        <td>
                          <select
                            className="select select-sm"
                            value={p.status}
                            onChange={(e) => vm.setStatus(p, e.target.value as ListingStatus)}
                            style={{ color: STATUS_META[p.status].color, fontWeight: 600 }}
                          >
                            {(Object.keys(STATUS_META) as ListingStatus[]).map((s) => (
                              <option key={s} value={s}>{STATUS_META[s].label}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            className="icon-btn icon-btn-sm"
                            title="Toggle featured"
                            onClick={() => vm.toggleFeatured(p)}
                            style={{ color: p.featured ? 'var(--orange)' : 'var(--text-muted)' }}
                          >
                            {p.featured ? '★' : '☆'}
                          </button>
                        </td>
                        <td className="muted">{formatDate(p.createdAt)}</td>
                        <td>
                          <div className="center-row" style={{ gap: 6 }}>
                            <button className="icon-btn icon-btn-sm" title="Edit" onClick={() => openEdit(p)}>✎</button>
                            <button
                              className="icon-btn icon-btn-sm"
                              title={p.approved ? 'Approved — click to reject' : 'Rejected — click to approve'}
                              onClick={() => vm.setApproved(p, !p.approved)}
                              style={{ color: p.approved ? 'var(--green)' : 'var(--orange)' }}
                            >
                              {p.approved ? '✓' : '⦸'}
                            </button>
                            <button
                              className="icon-btn icon-btn-sm danger"
                              title="Delete"
                              onClick={() => { if (confirm(`Delete "${p.title}"?`)) vm.deleteProperty(p.id); }}
                            >🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={vm.page} pageSize={vm.pageSize} total={vm.total} onPage={vm.setPage} />
            </>
          )}
        </div>
      )}

      {tab === 'inquiries' && (
        <div className="card card-pad">
          {vm.loadingInquiries ? (
            <Loader label="Loading inquiries…" />
          ) : vm.inquiries.length === 0 ? (
            <p className="muted center" style={{ padding: 24 }}>
              No inquiries yet. (Run <code>supabase/admin-setup.sql</code> to create the CRM table.)
            </p>
          ) : (
            <div className="table-scroll">
              <table className="table admin-table">
                <thead>
                  <tr><th>Type</th><th>Name</th><th>Contact</th><th>Message</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {vm.inquiries.map((q) => (
                    <tr key={q.id}>
                      <td><span className="badge badge-soft">{KIND_LABEL[q.kind]}</span></td>
                      <td><strong>{q.name}</strong></td>
                      <td className="muted">
                        <div>{q.email ?? '—'}</div>
                        {q.phone && <small>{q.phone}</small>}
                      </td>
                      <td className="muted truncate" style={{ maxWidth: 320 }}>{q.message ?? '—'}</td>
                      <td>
                        <select
                          className="select select-sm"
                          value={q.status}
                          onChange={(e) => vm.setInquiryStatus(q.id, e.target.value as InquiryStatus)}
                        >
                          {INQUIRY_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s === 'in_progress' ? 'In Progress' : s === 'new' ? 'New' : 'Closed'}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="card card-pad">
          <div className="table-scroll">
            <table className="table admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Plan</th><th>Joined</th></tr></thead>
              <tbody>
                {vm.users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.fullName ?? '—'}</strong></td>
                    <td className="muted">{u.email}</td>
                    <td><span className="badge badge-soft">{u.role}</span></td>
                    <td><span className="badge badge-soft">{u.plan ?? 'free'}</span></td>
                    <td className="muted">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PropertyFormModal
        open={modalOpen}
        editing={editing}
        saving={vm.saving}
        onClose={() => setModalOpen(false)}
        onSubmit={(draft) => (editing ? vm.updateProperty(editing.id, draft) : vm.createProperty(draft))}
      />
    </div>
  );
}
