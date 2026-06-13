// API calls for the RAG chat endpoint (AI Advisor).

import type { ChatMessage } from '@propertypulse/shared-types';
import { apiClient } from './apiClient';

export interface ChatAnswer {
  answer: string;
  sources: string[];
}

export const chatService = {
  async ask(question: string, history: ChatMessage[] = [], lang = 'en'): Promise<ChatAnswer> {
    const { data } = await apiClient.post<ChatAnswer>('/chat', { question, history, lang });
    return data;
  },
};
