/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'favicon.im',
      },
    ],
    unoptimized: true,
    // 注意：unoptimized 下图片不经优化器，remotePatterns 与 SVG 放行均不生效。
    // 若将来开启优化，必须先把 hostname: '**' 收窄为白名单，并谨慎放开 SVG。
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
