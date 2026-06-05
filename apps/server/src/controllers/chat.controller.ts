// Chat controller: grounded natural-language Q&A (RAG + LLM).
// Retrieves context, builds a grounded prompt, and returns the answer with its sources.

import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { retrieve } from '../ai/rag/retriever.js';
import { geminiClient } from '../ai/llm/geminiClient.js';
import { buildQaPrompt } from '../ai/llm/prompts/qa.prompt.js';

export const chatController = {
  /** POST /chat  { question: string, history?: ChatMessage[] } */
  ask: asyncHandler(async (req, res) => {
    const { question, history } = req.body;
    if (!question || typeof question !== 'string') {
      throw ApiError.badRequest('A "question" string is required');
    }

    const retrieval = await retrieve(question, 6);
    const prompt = buildQaPrompt({ question, context: retrieval.context, history });
    const answer = await geminiClient.generate(prompt.user, {
      system: prompt.system,
      temperature: 0.3,
    });

    ok(res, { answer, sources: retrieval.sources });
  }),
};
