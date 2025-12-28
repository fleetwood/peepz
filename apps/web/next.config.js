/** @type {import('next').NextConfig} */
require('dotenv').config({ path: '../../.env' })

const nextConfig = {
  experimental: {
    externalDir: true,
  },
  transpilePackages: [
    '@peeps/client',
    '@peeps/db',
    '@peeps/services',
    '@peeps/types',
    '@peeps/utils',
    '@peeps/config',
  ],
}

module.exports = nextConfig
