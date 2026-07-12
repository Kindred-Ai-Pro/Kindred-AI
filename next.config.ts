import type { NextConfig } from "next";

// Only set when testing Capacitor on a physical device, e.g.:
// NEXT_PUBLIC_ASSET_PREFIX=http://192.168.1.14:3000
// Never apply asset prefix in production — prevents broken CSS on the public site.
const assetPrefix =
  process.env.NODE_ENV === "production"
    ? undefined
    : process.env.NEXT_PUBLIC_ASSET_PREFIX;

const nextConfig: NextConfig = {
  ...(assetPrefix ? { assetPrefix } : {}),
  // Capacitor WebView loads from these origins in dev — required for JS/HMR.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.1.126",
    "capacitor://localhost",
    "ionic://localhost",
  ],
};

export default nextConfig;
