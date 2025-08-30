import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("http://localhost:8000/files/**"),
      new URL("https://ggg-api.iustb0.fun/files/**"),
    ],
  },
};

export default nextConfig;
