'use client';

import { useEffect } from 'react';

/** Loads crypto polyfill only in the browser at runtime. */
export function CryptoPolyfill() {
  useEffect(() => {
    void import('@/lib/crypto-polyfill');
  }, []);

  return null;
}
