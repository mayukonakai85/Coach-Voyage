

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.b-cdn.net",
      },
      {
        protocol: "https",
        hostname: "**.bunnycdn.com",
      },
    ],
  },
};

export default nextConfig;
