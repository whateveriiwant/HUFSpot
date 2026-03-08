import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.dirname(__filename);

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  reactCompiler: true,
};

export default nextConfig;
