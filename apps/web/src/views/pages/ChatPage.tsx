// AI Advisor chat page (View) — full conversation + suggestion chips.

import { useState } from 'react';
import { useChatViewModel } from '../../viewmodels/useChatViewModel';
import { useI18n } from '../../i18n';
import { Markdown } from '../components/common/Markdown';
import type { TranslationKey } from '../../i18n/translations';

const SUGGESTION_KEYS: TranslationKey[] = ['chat.s1', 'chat.s2', 'chat.s3', 'chat.s4'];

export function ChatPage() {
  const { messages, sources, loading, send } = useChatViewModel();
  const { t } = useI18n();
  const [text, setText] = useState('');

  function submit(value?: string) {
    const q = value ?? text;
    send(q);
    setText('');
  }

  return (
    <div className="col" style={{ gap: 16, height: 'calc(100vh - 150px)' }}>
      <div className="card card-pad grow col" style={{ gap: 14, overflowY: 'auto' }}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role === 'user' ? 'chat-user' : 'chat-ai'}`}>
            {m.role === 'user' ? m.content : <Markdown text={m.content} />}
          </div>
        ))}
        {loading && <div className="chat-msg chat-ai"><span className="spinner" style={{ width: 16, height: 16 }} /></div>}
        {!!sources.length && (
          <div className="muted" style={{ fontSize: '0.78rem' }}>Sources: {sources.join(' · ')}</div>
        )}
      </div>

      <div className="row wrap" style={{ gap: 8 }}>
        {SUGGESTION_KEYS.map((k) => (
          <button key={k} className="chip" onClick={() => submit(t(k))}>{t(k)}</button>
        ))}
      </div>

      <div className="chat-input-bar">
        <input
          placeholder={t('chat.placeholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button className="btn btn-green" onClick={() => submit()} style={{ borderRadius: '50%', width: 40, height: 40, padding: 0 }} aria-label="Send">
          ➤
        </button>
      </div>
    </div>
  );
}
