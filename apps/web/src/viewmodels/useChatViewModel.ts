// ViewModel: AI Advisor chat (RAG-backed Q&A) with message history.

import { useState } from 'react';
import type { ChatMessage } from '@propertypulse/shared-types';
import { chatService } from '../services/api/chatService';
import { useUiStore } from '../store/uiStore';

export function useChatViewModel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi — I’m your AI Advisor. Ask me about yields, risk, market trends or any property in your portfolio.',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const lang = useUiStore((s) => s.lang);

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed, createdAt: new Date().toISOString() };
    const history = messages.filter((m) => m.role !== 'system');
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const { answer, sources: srcs } = await chatService.ask(trimmed, history, lang);
      setMessages((m) => [...m, { role: 'assistant', content: answer, createdAt: new Date().toISOString() }]);
      setSources(srcs);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'Sorry — I couldn’t reach the analysis engine. Please try again.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return { messages, sources, loading, send };
}
