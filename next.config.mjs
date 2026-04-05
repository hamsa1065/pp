/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  api: {
    bodyParser: false,
  },
};

export default nextConfig;
