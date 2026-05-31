/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias["@splinetool/react-spline$"] = path.resolve(
      __dirname,
      "node_modules/@splinetool/react-spline/dist/react-spline.js"
    );
    config.resolve.alias["@splinetool/runtime$"] = path.resolve(
      __dirname,
      "node_modules/@splinetool/runtime/build/runtime.js"
    );
    return config;
  },
};

export default nextConfig;
