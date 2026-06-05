// Prompt template for grounded natural-language Q&A (RAG chat).
// The retrieved context is the ONLY source of truth; the model must say when it
// doesn't know rather than hallucinate.

import type { ChatMessage } from '@propertypulse/shared-types';

export interface QaPromptInput {
  question: string;
  context: string;
  history?: ChatMessage[];
}

export interface QaPromptOutput {
  system: string;
  user: string;
}

export function buildQaPrompt(input: QaPromptInput): QaPromptOutput {
  const { question, context, history = [] } = input;

  const system = [
    'You are PropertyPulse, a helpful real-estate investment assistant.',
    'Answer using ONLY the provided context. If the context is insufficient, say so honestly.',
    'Cite the bracketed source numbers (e.g. [1]) when you use a fact. Keep answers concise.',
  ].join(' ');

  const historyText = history
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const user = `
${historyText ? `CONVERSATION SO FAR\n${historyText}\n\n` : ''}CONTEXT
${context || 'No context retrieved.'}

QUESTION
${question}`.trim();

  return { system, user };
}
