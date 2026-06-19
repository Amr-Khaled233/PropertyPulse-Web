// Admin console (View) — restricted to admin accounts.
// Property Management (CRUD + moderation), CRM inquiries, and users overview.

import { useState } from 'react';
import type { Property, ListingStatus, InquiryStatus, PlanTier } from '@propertypulse/shared-types';
import { useAdminViewModel } from '../../viewmodels/useAdminViewModel';
import { useI18n, type TranslationKey } from '../../i18n';
import { formatCompactCurrency, formatDate } from '../../utils/formatters';
import { propertyImage } from '../../utils/propertyImages';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { Pagination } from '../components/common/Pagination';
import { PropertyFormModal } from '../components/admin/PropertyFormModal';

type Tab = 'properties' | 'inquiries' | 'users';

const STATUS_COLOR: Record<ListingStatus, string> = {
  for_sale: 'var(--green)',
  for_rent: '#2563eb',
  sold: 'var(--text-muted)',
  off_market: 'var(--orange)',
};
const LISTING_STATUSES: ListingStatus[] = ['for_sale', 'for_rent', 'sold', 'off_market'];
const INQUIRY_STATUSES: InquiryStatus[] = ['new', 'in_progress', 'closed'];
const USER_PLANS: PlanTier[] = ['free', 'pro'];

export function AdminPage() {
  const vm = useAdminViewModel();
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('properties');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Property) => { setEditing(p); setModalOpen(true); };

  // Safe-localize dynamic enum values (fall back to the raw value if unmapped).
  const tx = (key: string, fallback: string) => {
    const v = t(key as TranslationKey);
    return v === key ? fallback : v;
  };

  const stats = [
    { icon: '🏢', label: t('admin.stat.listings'), value: vm.total.toLocaleString() },
    { icon: '👥', label: t('admin.stat.users'), value: vm.users.length.toLocaleString() },
    { icon: '✉️', label: t('admin.stat.openInquiries'), value: String(vm.inquiries.filter((i) => i.status !== 'closed').length) },
    { icon: '⭐', label: t('admin.stat.featured'), value: String(vm.properties.filter((p) => p.featured).length) },
  ];

  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="page-header">
        <div>
          <span className="eyebrow">{t('admin.console')}</span>
          <h1 style={{ margin: '4px 0 0' }}>{t('admin.pageTitle')}</h1>
        </div>
        {tab === 'properties' && (
          <Button variant="green" size="sm" onClick={openAdd}>{t('admin.addProperty')}</Button>
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
            {tk === 'properties' ? t('admin.tab.properties') : tk === 'inquiries' ? t('admin.tab.inquiries') : t('admin.tab.users')}
          </button>
        ))}
      </div>

      {tab === 'properties' && (
        <div className="card card-pad">
          {vm.loadingProps ? (
            <Loader label={t('admin.loadingProps')} />
          ) : (
            <>
              <div className="table-scroll">
                <table className="table admin-table">
                  <thead>
                    <tr>
                      <th></th><th>{t('admin.col.title')}</th><th>{t('admin.col.price')}</th><th>{t('admin.col.location')}</th>
                      <th>{t('admin.col.type')}</th><th>{t('admin.col.status')}</th><th>{t('admin.col.featured')}</th><th>{t('admin.col.added')}</th><th>{t('admin.col.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vm.properties.map((p) => (
                      <tr key={p.id}>
                        <td className="admin-thumb-cell"><div className="thumb" style={{ backgroundImage: `url(${propertyImage(p)})` }} /></td>
                        <td data-label={t('admin.col.title')}>
                          <strong className="truncate" style={{ display: 'block', maxWidth: 220 }}>{p.title}</strong>
                          <small className="muted">{p.agentName ?? '—'}</small>
                        </td>
                        <td data-label={t('admin.col.price')}>{formatCompactCurrency(p.price, p.currency)}</td>
                        <td className="muted" data-label={t('admin.col.location')}>{[p.address.state, p.address.city].filter(Boolean).join(' · ')}</td>
                        <td data-label={t('admin.col.type')}><span className="badge badge-soft">{tx(`admin.ptype.${p.type}`, p.type)}</span></td>
                        <td data-label={t('admin.col.status')}>
                          <select
                            className="select select-sm"
                            value={p.status}
                            onChange={(e) => vm.setStatus(p, e.target.value as ListingStatus)}
                            style={{ color: STATUS_COLOR[p.status], fontWeight: 600 }}
                          >
                            {LISTING_STATUSES.map((s) => (
                              <option key={s} value={s}>{t(`admin.status.${s}` as TranslationKey)}</option>
                            ))}
                          </select>
                        </td>
                        <td data-label={t('admin.col.featured')}>
                          <button
                            className="icon-btn icon-btn-sm"
                            title={t('admin.toggleFeatured')}
                            onClick={() => vm.toggleFeatured(p)}
                            style={{ color: p.featured ? 'var(--orange)' : 'var(--text-muted)' }}
                          >
                            {p.featured ? '★' : '☆'}
                          </button>
                        </td>
                        <td className="muted admin-date" data-label={t('admin.col.added')}>{formatDate(p.createdAt)}</td>
                        <td data-label={t('admin.col.actions')}>
                          <div className="center-row" style={{ gap: 6 }}>
                            <button className="icon-btn icon-btn-sm" title={t('admin.edit')} onClick={() => openEdit(p)}>✎</button>
                            <button
                              className="icon-btn icon-btn-sm"
                              title={p.approved ? t('admin.approved') : t('admin.rejected')}
                              onClick={() => vm.setApproved(p, !p.approved)}
                              style={{ color: p.approved ? 'var(--green)' : 'var(--orange)' }}
                            >
                              {p.approved ? '✓' : '⦸'}
                            </button>
                            <button
                              className="icon-btn icon-btn-sm danger"
                              title={t('admin.delete')}
                              onClick={() => { if (confirm(t('admin.deleteConfirm').replace('{title}', p.title))) vm.deleteProperty(p.id); }}
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
            <Loader label={t('admin.loadingInquiries')} />
          ) : vm.inquiries.length === 0 ? (
            <p className="muted center" style={{ padding: 24 }}>
              {t('admin.noInquiries')} <code>{t('admin.noInquiriesHint')}</code>
            </p>
          ) : (
            <div className="table-scroll">
              <table className="table admin-table">
                <thead>
                  <tr><th>{t('admin.col.type')}</th><th>{t('admin.col.name')}</th><th>{t('admin.col.contact')}</th><th>{t('admin.col.message')}</th><th>{t('admin.col.status')}</th><th>{t('admin.col.actions')}</th></tr>
                </thead>
                <tbody>
                  {vm.inquiries.map((q) => (
                    <tr key={q.id}>
                      <td data-label={t('admin.col.type')}><span className="badge badge-soft">{t(`admin.kind.${q.kind}` as TranslationKey)}</span></td>
                      <td data-label={t('admin.col.name')}><strong>{q.name}</strong></td>
                      <td className="muted" data-label={t('admin.col.contact')}>
                        <div>{q.email ?? '—'}</div>
                        {q.phone && <small>{q.phone}</small>}
                      </td>
                      <td className="muted truncate" style={{ maxWidth: 320 }} data-label={t('admin.col.message')}>{q.message ?? '—'}</td>
                      <td data-label={t('admin.col.status')}>
                        <select
                          className="select select-sm"
                          value={q.status}
                          onChange={(e) => vm.setInquiryStatus(q.id, e.target.value as InquiryStatus)}
                        >
                          {INQUIRY_STATUSES.map((s) => (
                            <option key={s} value={s}>{t(`admin.iStatus.${s}` as TranslationKey)}</option>
                          ))}
                        </select>
                      </td>
                      <td data-label={t('admin.col.actions')}>
                        <button
                          className="icon-btn icon-btn-sm danger"
                          title={t('admin.delete')}
                          onClick={() => { if (confirm(t('admin.deleteInquiryConfirm'))) vm.deleteInquiry(q.id); }}
                        >🗑</button>
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
              <thead><tr><th>{t('admin.col.name')}</th><th>{t('admin.col.email')}</th><th>{t('admin.col.role')}</th><th>{t('admin.col.plan')}</th><th>{t('admin.col.joined')}</th><th>{t('admin.col.actions')}</th></tr></thead>
              <tbody>
                {vm.users.map((u) => (
                  <tr key={u.id}>
                    <td data-label={t('admin.col.name')}><strong>{u.fullName ?? '—'}</strong></td>
                    <td className="muted" data-label={t('admin.col.email')}>{u.email}</td>
                    <td data-label={t('admin.col.role')}><span className="badge badge-soft">{tx(`admin.role.${u.role}`, u.role)}</span></td>
                    <td data-label={t('admin.col.plan')}>
                      <select
                        className="select select-sm"
                        value={u.plan ?? 'free'}
                        onChange={(e) => vm.setUserPlan(u.id, e.target.value as PlanTier)}
                      >
                        {USER_PLANS.map((p) => (
                          <option key={p} value={p}>{t(`admin.plan.${p}` as TranslationKey)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="muted admin-date" data-label={t('admin.col.joined')}>{formatDate(u.createdAt)}</td>
                    <td data-label={t('admin.col.actions')}>
                      {u.role !== 'admin' && (
                        <button
                          className="icon-btn icon-btn-sm danger"
                          title={t('admin.delete')}
                          onClick={() => { if (confirm(t('admin.deleteUserConfirm').replace('{name}', u.fullName || u.email))) vm.deleteUser(u.id); }}
                        >🗑</button>
                      )}
                    </td>
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
