import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  // Default rewrite proxy timeout is ~30s; briefing+sync can run many minutes (Ollama batches).
  experimental: {
    proxyTimeout: 30 * 60 * 1000, // 30 minutes (ms)
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
