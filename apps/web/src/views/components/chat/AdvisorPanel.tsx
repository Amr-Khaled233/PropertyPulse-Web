// Compact AI Advisor panel (used on the dashboard sidebar).

import { useState } from 'react';
import { useChatViewModel } from '../../../viewmodels/useChatViewModel';
import { useI18n } from '../../../i18n';

export function AdvisorPanel() {
  const { messages, loading, send } = useChatViewModel();
  const { t } = useI18n();
  const [text, setText] = useState('');

  function submit() {
    send(text);
    setText('');
  }

  return (
    <div className="card-dark" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', minHeight: 460 }}>
      <div className="center-row" style={{ padding: '16px 18px', borderBottom: '1px solid var(--navy-600)' }}>
        <span className="avatar" style={{ background: 'var(--green)' }}>✦</span>
        <b className="serif">{t('chat.title')}</b>
      </div>

      <div className="col" style={{ gap: 12, padding: 16, overflowY: 'auto', flex: 1 }}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role === 'user' ? 'chat-user' : 'chat-ai'}`}>
            {m.content}
          </div>
        ))}
        {loading && <div className="chat-msg chat-ai"><span className="spinner" style={{ width: 16, height: 16 }} /></div>}
      </div>

      <div style={{ padding: 12 }}>
        <div className="chat-input-bar" style={{ background: 'var(--navy-700)', border: '1px solid var(--navy-600)' }}>
          <input
            placeholder={t('chat.placeholder')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            style={{ color: '#fff' }}
          />
          <button className="btn btn-green btn-sm" onClick={submit} aria-label="Send" style={{ borderRadius: '50%', width: 36, height: 36, padding: 0 }}>
            ➤
          </button>
        </div>
        <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.72rem', textAlign: 'center', margin: '8px 0 0' }}>
          {t('chat.disclaimer')}
        </p>
      </div>
    </div>
  );
}
