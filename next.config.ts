import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/ready/:destination",
        destination: "/ready/fr/:destination",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
