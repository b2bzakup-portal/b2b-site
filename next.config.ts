import type { NextConfig } from "next";

/**
 * Прототип собирается в статику и публикуется на GitHub Pages
 * из папки docs/ репозитория, поэтому все адреса живут под /b2b-site.
 */
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/b2b-site",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
