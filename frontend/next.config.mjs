// Security headers on every page. No full Content-Security-Policy yet (map tiles, Google sign-in,
// image hosts would all need listing), only the parts that can't break the site.
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // no framing by other sites (clickjacking)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
  // geolocation: "near me" on /destinations
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self)' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'backend-yikc.onrender.com' },
      { protocol: 'http', hostname: 'localhost', port: '5000' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
