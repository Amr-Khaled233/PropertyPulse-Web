// Translation service — localizes listing text (title/description) to Arabic on
// demand via Gemini. Results are cached in memory so each property is translated
// at most once per server instance, and it degrades gracefully to the original
// English text when the model is unavailable (e.g. quota exhausted).

import type { Property } from '@propertypulse/shared-types';
import { geminiClient } from '../ai/llm/geminiClient.js';
import { logger } from '../utils/logger.js';

const cache = new Map<string, { title: string; description: string }>();

export async function localizeProperty(property: Property, lang?: string): Promise<Property> {
  if (lang !== 'ar') return property;

  const key = `${property.id}:ar`;
  const cached = cache.get(key);
  if (cached) return { ...property, title: cached.title, description: cached.description };

  try {
    const prompt = [
      'Translate the following real-estate listing fields into clear Modern Standard Arabic.',
      'Keep all numbers, measurements (m², bedrooms, prices) and proper place names accurate.',
      'Do not add any commentary, notes or extra fields.',
      'Return ONLY a JSON object of the form {"title": "...", "description": "..."}.',
      '',
      `TITLE: ${property.title}`,
      `DESCRIPTION: ${property.description ?? ''}`,
    ].join('\n');

    const out = await geminiClient.generateJSON<{ title?: string; description?: string }>(prompt, {
      temperature: 0.2,
    });
    const title = (out.title || property.title).trim();
    const description = (out.description || property.description || '').trim();
    cache.set(key, { title, description });
    return { ...property, title, description };
  } catch (err) {
    // Cache the original so we don't re-hit a (likely rate-limited) model on every
    // view — the page stays fast and falls back to English until quota is available.
    // The cache is in-memory, so a server restart lets it try translating again.
    logger.warn({ id: property.id }, 'Arabic translation unavailable — returning original text');
    cache.set(key, { title: property.title, description: property.description ?? '' });
    return property;
  }
}
