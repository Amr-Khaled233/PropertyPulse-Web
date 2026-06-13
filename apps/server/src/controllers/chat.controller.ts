// Chat controller: grounded natural-language Q&A (RAG + LLM).
// Retrieves context, builds a grounded prompt, and returns the answer with its sources.

import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { retrieve } from '../ai/rag/retriever.js';
import { buildMarketContext } from '../ai/chatContext.js';
import { geminiClient } from '../ai/llm/geminiClient.js';
import { buildQaPrompt } from '../ai/llm/prompts/qa.prompt.js';
import { logger } from '../utils/logger.js';

export const chatController = {
  /** POST /chat  { question: string, history?: ChatMessage[], lang? } */
  ask: asyncHandler(async (req, res) => {
    const { question, history, lang } = req.body;
    if (!question || typeof question !== 'string') {
      throw ApiError.badRequest('A "question" string is required');
    }

    // Ground the advisor in live dataset data (always) plus any RAG hits.
    const [retrieval, liveContext] = await Promise.all([
      retrieve(question, 6),
      buildMarketContext().catch(() => ''),
    ]);
    const context = [liveContext, retrieval.context].filter(Boolean).join('\n\n');

    const prompt = buildQaPrompt({ question, context, history, lang });
    try {
      const answer = await geminiClient.generate(prompt.user, { system: prompt.system, temperature: 0.3 });
      ok(res, { answer, sources: retrieval.sources });
    } catch (err) {
      // The AI model is unavailable (quota/outage). Don't fail — return the real
      // live market data so the user still gets a useful, grounded answer.
      logger.warn({ err }, 'Chat LLM unavailable — returning live-data fallback');
      const header =
        lang === 'ar'
          ? 'المستشار الذكي مشغول حاليًا، لكن إليك أحدث بيانات السوق من قاعدة بياناتنا:'
          : 'The AI advisor is busy right now, but here is the latest market data from our dataset:';
      const answer = liveContext
        ? `${header}\n\n${liveContext}`
        : lang === 'ar'
          ? 'المستشار الذكي غير متاح مؤقتًا. برجاء المحاولة بعد قليل.'
          : 'The AI advisor is temporarily unavailable. Please try again shortly.';
      ok(res, { answer, sources: retrieval.sources });
    }
  }),
};
