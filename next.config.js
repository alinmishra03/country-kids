/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Images are plain <img> tags throughout, matching the reference project's
    // migration parity. unoptimized keeps any stray <Image> honest too.
    images: { unoptimized: true },
};

module.exports = nextConfig;
