// Translation service — localizes listing text (title/description) to Arabic on
// demand. Uses the free MyMemory translation API (no API key, no Gemini quota),
// chunks long text to respect the per-request length limit, caches results in
// memory so each property is translated at most once per server instance, and
// degrades gracefully to the original English text when translation fails.

import type { Property } from '@propertypulse/shared-types';
import { logger } from '../utils/logger.js';

const cache = new Map<string, { title: string; description: string }>();
const MAX_CHUNK = 450; // MyMemory anonymous limit is 500 chars/request

/** Translate a single short string (≤ MAX_CHUNK) via MyMemory. Throws on failure. */
async function translateChunk(text: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    const json = (await res.json()) as { responseStatus?: number; responseData?: { translatedText?: string } };
    const out = json.responseData?.translatedText;
    if (json.responseStatus !== 200 || !out || /QUERY LENGTH|INVALID|PLEASE SELECT/i.test(out)) {
      throw new Error(`MyMemory: ${out ?? 'no translation'}`);
    }
    return out;
  } finally {
    clearTimeout(timer);
  }
}

/** Split text into ≤MAX_CHUNK pieces on sentence boundaries, then translate each. */
async function translateText(text: string): Promise<string> {
  if (!text.trim()) return text;
  const sentences = text.split(/(?<=[.!?؟])\s+/);
  const chunks: string[] = [];
  let buf = '';
  for (const s of sentences) {
    if ((buf + ' ' + s).trim().length > MAX_CHUNK) {
      if (buf) chunks.push(buf.trim());
      buf = s.length > MAX_CHUNK ? s.slice(0, MAX_CHUNK) : s;
    } else {
      buf = `${buf} ${s}`;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());

  const translated = await Promise.all(chunks.map(translateChunk));
  return translated.join(' ');
}

export async function localizeProperty(property: Property, lang?: string): Promise<Property> {
  if (lang !== 'ar') return property;

  const key = `${property.id}:ar`;
  const cached = cache.get(key);
  if (cached) return { ...property, title: cached.title, description: cached.description };

  try {
    const [title, description] = await Promise.all([
      translateText(property.title),
      translateText(property.description ?? ''),
    ]);
    cache.set(key, { title, description });
    return { ...property, title, description };
  } catch (err) {
    // Cache the original so we don't re-hit the API on every view; the page stays
    // fast and shows English until translation succeeds (cache clears on restart).
    logger.warn({ id: property.id, err: err instanceof Error ? err.message : err }, 'Arabic translation unavailable — returning original text');
    cache.set(key, { title: property.title, description: property.description ?? '' });
    return property;
  }
}
