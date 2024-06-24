/** @type {import('next').NextConfig} */
const ContentSecurityPolicy = require('./csp');
const redirects = require('./redirects');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost', 
      process.env.NEXT_PUBLIC_SERVER_URL, 
      'lh3.googleusercontent.com', // Add the Googleusercontent domain here
    ].filter(Boolean).map(url => url.replace(/https?:\/\//, '')),
  },
  redirects,
  async headers() {
    const headers = [];

    // Prevent search engines from indexing the site if it is not live
    if (!process.env.NEXT_PUBLIC_IS_LIVE) {
      headers.push({
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
        source: '/:path*',
      });
    }

    // Set the `Content-Security-Policy` header
    headers.push({
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: ContentSecurityPolicy,
        },
      ],
    });

    return headers;
  },
};

module.exports = nextConfig;
