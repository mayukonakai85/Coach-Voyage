

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.b-cdn.net",
      },
      {
        protocol: "https",
        hostname: "thumbnail.bunnycdn.com",
      },
      {
        protocol: "https",
        hostname: "vz-*.b-cdn.net",
      },
    ],
  },
};

export default nextConfig;
