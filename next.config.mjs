/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'rivo.gallery',
          },
        ],
      },
};

export default nextConfig;
