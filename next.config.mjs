/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Webpack alias for the prod build: pins Spline to its built entry points
// so resolution is identical regardless of what the package's exports map
// might shift to in a future version. Turbopack uses the package's exports
// map directly (which already points at these same files), so it doesn't
// need an equivalent alias — Turbopack rejects absolute-path aliases as
// "server-relative imports" anyway.
const splineReactSpline = path.resolve(
  __dirname,
  "node_modules/@splinetool/react-spline/dist/react-spline.js",
);
const splineRuntime = path.resolve(
  __dirname,
  "node_modules/@splinetool/runtime/build/runtime.js",
);

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias["@splinetool/react-spline$"] = splineReactSpline;
    config.resolve.alias["@splinetool/runtime$"] = splineRuntime;
    return config;
  },
};

export default nextConfig;
