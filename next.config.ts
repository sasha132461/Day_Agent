import type { NextConfig } from "next";
import path from "path";

const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  // Turbopack інакше помилково бере `src/app` як root у деяких середовищах (Cursor / monorepo).
  turbopack: {
    root: path.resolve(process.cwd()),
  },
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
