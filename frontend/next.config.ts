/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Whenever your Next.js app calls /api/backend/something...
        source: '/api/backend/:path*',

        // ...it will secretly forward the request here:
        // Replace 'your-university-domain.edu' with the actual domain.
        destination: 'https://iot.cpe.ku.ac.th/red/b6710545989/checkbin/api/:path*',
      },
    ];
  },
};

export default nextConfig;