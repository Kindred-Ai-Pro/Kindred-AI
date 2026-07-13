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

/** Models to try in order — AI Studio keys may not support every model ID. */
export const GOOGLE_CHAT_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
] as const;
