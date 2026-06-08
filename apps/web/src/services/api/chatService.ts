// API calls for the RAG chat endpoint (AI Advisor).

import type { ChatMessage } from '@propertypulse/shared-types';
import { apiClient, IS_MOCK, mockDelay } from './apiClient';

export interface ChatAnswer {
  answer: string;
  sources: string[];
}

const MOCK_ANSWERS = [
  'Based on current data, New Cairo commercial units show the strongest momentum — rental demand surged ~15% this quarter, lifting projected net yields above 7%.',
  'The average rental yield in Sheikh Zayed is cooling slightly. Rebalancing toward commercial assets in high-footfall corridors would improve your risk-adjusted return.',
  'Heliopolis offers steady appreciation with low vacancy. For a 5-year hold, the projected ROI is roughly 62–68% under base-case assumptions.',
];

export const chatService = {
  async ask(question: string, history: ChatMessage[] = [], lang = 'en'): Promise<ChatAnswer> {
    if (IS_MOCK) {
      const answer = MOCK_ANSWERS[history.length % MOCK_ANSWERS.length];
      return mockDelay(
        { answer, sources: ['Egyptian Market Index 2025', 'Rental Demand Survey Q1'] },
        700,
      );
    }
    const { data } = await apiClient.post<ChatAnswer>('/chat', { question, history, lang });
    return data;
  },
};
