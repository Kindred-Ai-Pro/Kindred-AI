import 'server-only';

import { createGoogle } from '@ai-sdk/google';

export function getGoogleApiKey(): string | undefined {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim()
  );
}

export function createGoogleProvider() {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    return null;
  }

  return createGoogle({ apiKey });
}

/** Models to try in order — keep current IDs; legacy 1.5/2.0 were retired in 2026. */
export const GOOGLE_CHAT_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
] as const;

export function getGoogleChatModelIds(): readonly string[] {
  const override = process.env.GOOGLE_CHAT_MODEL?.trim();
  if (override) {
    return [override, ...GOOGLE_CHAT_MODELS.filter((id) => id !== override)];
  }
  return GOOGLE_CHAT_MODELS;
}
