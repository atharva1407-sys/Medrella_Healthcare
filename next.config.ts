import type { NextConfig } from "next";

// Server initialization environment validation
if (process.env.NODE_ENV === "production" && process.env.SKIP_ENV_VALIDATION !== "true") {
  try {
    const { validateEnv } = require("./src/lib/env");
    validateEnv();
  } catch (err: any) {
    if (process.env.CI || process.env.VERCEL) {
      console.error(err.message);
      throw err;
    }
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/patient/assistant",
        destination: "/patient/dashboard",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://api.sarvam.ai",
              "frame-src https://api.razorpay.com https://checkout.razorpay.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
