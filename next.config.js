/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer must run as a real Node module (it uses Node built-ins
  // and its own JSX runtime) — don't let Next bundle it into the route.
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
  // `/` → /en or /es (by Accept-Language) lives in middleware.ts — config
  // redirects run before middleware and can't vary by language.
};

module.exports = nextConfig;
