// Contact / request-viewing form shown on a property page. Submissions land in
// the admin CRM (Inquiries).

import { useState } from 'react';
import type { InquiryKind } from '@propertypulse/shared-types';
import { inquiryService } from '../../../services/api/inquiryService';
import { useUiStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { useI18n } from '../../../i18n';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface Props {
  open: boolean;
  propertyId: string;
  propertyTitle: string;
  onClose: () => void;
}

const KINDS: { value: InquiryKind; labelKey: 'inquiry.kViewing' | 'inquiry.kBuyer' | 'inquiry.kContact' }[] = [
  { value: 'viewing_request', labelKey: 'inquiry.kViewing' },
  { value: 'buyer_inquiry', labelKey: 'inquiry.kBuyer' },
  { value: 'contact_message', labelKey: 'inquiry.kContact' },
];

export function InquiryModal({ open, propertyId, propertyTitle, onClose }: Props) {
  const { t } = useI18n();
  const pushToast = useUiStore((s) => s.pushToast);
  const user = useAuthStore((s) => s.user);
  const [kind, setKind] = useState<InquiryKind>('viewing_request');
  // Prefill from the signed-in account so inquiries are tied to a real user.
  const [name, setName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await inquiryService.create({
        kind,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        message: message.trim() || `Inquiry about: ${propertyTitle}`,
        propertyId,
      });
      pushToast(t('inquiry.sent'), 'success');
      setName(''); setEmail(''); setPhone(''); setMessage('');
      onClose();
    } catch {
      pushToast(t('inquiry.failed'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      title={t('inquiry.title')}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="green" size="sm" onClick={submit} disabled={!name.trim() || saving}>
            {saving ? t('inquiry.sending') : t('inquiry.send')}
          </Button>
        </>
      }
    >
      <div className="col" style={{ gap: 12 }}>
        <div className="field">
          <label className="label">{t('inquiry.type')}</label>
          <select className="select" value={kind} onChange={(e) => setKind(e.target.value as InquiryKind)}>
            {KINDS.map((k) => <option key={k.value} value={k.value}>{t(k.labelKey)}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label">{t('inquiry.name')}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-2" style={{ gap: 12 }}>
          <div className="field">
            <label className="label">{t('inquiry.email')}</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">{t('inquiry.phone')}</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="label">{t('inquiry.message')}</label>
          <textarea className="input" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
