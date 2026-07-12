/**
 * Patch crypto.randomUUID for non-secure contexts (HTTP dev on iOS WebView).
 * Import this module once before any code calls crypto.randomUUID().
 */
function fallbackRandomUUID(): `${string}-${string}-${string}-${string}-${string}` {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  }) as `${string}-${string}-${string}-${string}-${string}`;
}

if (typeof globalThis !== 'undefined') {
  const cryptoObj = globalThis.crypto ?? ({} as Crypto);

  if (typeof cryptoObj.randomUUID !== 'function') {
    cryptoObj.randomUUID = fallbackRandomUUID;
    globalThis.crypto = cryptoObj;
  }
}
