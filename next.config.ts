import type { NextConfig } from "next";

const config: NextConfig = {
  async headers() {
    const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').origin;
    const csp = `default-src 'self'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com; font-src 'self' data:; connect-src 'self' ${api}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
    return [
      {source:'/:path*',headers:[
        {key:'Referrer-Policy',value:'no-referrer'},
        {key:'X-Content-Type-Options',value:'nosniff'},
        {key:'X-Frame-Options',value:'DENY'},
        {key:'Content-Security-Policy',value:csp},
        {key:'Strict-Transport-Security',value:'max-age=31536000'},
      ]},
      {source:'/journey-share/:path*',headers:[{key:'Cache-Control',value:'private, no-store, max-age=0'},{key:'X-Robots-Tag',value:'noindex, nofollow'}]},
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default config;
