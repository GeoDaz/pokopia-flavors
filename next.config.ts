import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-63d9fdd35f184b7c82eb49a6ebead636.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.serebii.net",
        pathname: "/pokemonpokopia/**",
      },
    ],
  },
};

export default nextConfig;
