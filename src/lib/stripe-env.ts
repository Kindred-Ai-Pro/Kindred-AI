export function readStripeEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) {
    return undefined;
  }

  let value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  return value || undefined;
}

export type StripeKeyMode = 'live' | 'test' | 'publishable' | 'invalid';

export function getStripeKeyMode(key: string | undefined): StripeKeyMode {
  if (!key) {
    return 'invalid';
  }

  if (key.startsWith('sk_live_')) {
    return 'live';
  }

  if (key.startsWith('sk_test_')) {
    return 'test';
  }

  if (key.startsWith('pk_live_') || key.startsWith('pk_test_')) {
    return 'publishable';
  }

  return 'invalid';
}

export function describeStripeKeyProblem(key: string | undefined): string | null {
  const mode = getStripeKeyMode(key);

  if (mode === 'publishable') {
    return 'STRIPE_SECRET_KEY is a publishable key (pk_...). Use the secret key (sk_...) from Stripe → Developers → API keys.';
  }

  if (mode === 'invalid') {
    return 'STRIPE_SECRET_KEY must start with sk_live_ or sk_test_.';
  }

  return null;
}
