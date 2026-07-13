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
