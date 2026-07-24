/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer must run as a real Node module (it uses Node built-ins
  // and its own JSX runtime) — don't let Next bundle it into the route.
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
