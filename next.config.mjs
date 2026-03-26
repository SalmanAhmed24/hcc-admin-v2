/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  transpilePackages: ["@excalidraw/excalidraw"],
};

export default nextConfig;
