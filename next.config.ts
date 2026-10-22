import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos dos pilotos (via OpenF1) passam pelo otimizador do Next e são
    // servidas pelo próprio domínio do site.
    remotePatterns: [{ protocol: "https", hostname: "media.formula1.com" }],
  },
  async redirects() {
    return [{ source: "/dashboard", destination: "/", permanent: true }];
  },
};

export default nextConfig;
