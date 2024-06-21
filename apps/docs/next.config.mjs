import createMDX from 'fumadocs-mdx/config';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui" , "anjum"],
  images: {
    remotePatterns:[
      {
        protocol: 'https',
        hostname:"github.com"
      }
    ]
  }
};

export default withMDX(config);
