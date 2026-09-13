import { defineConfig, loadEnv, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

function createApiProxy(target: string): Record<string, ProxyOptions> {
  const proxyFor = (): ProxyOptions => ({
    target,
    changeOrigin: true,
    configure(proxyServer) {
      proxyServer.on("proxyReq", (proxyReq) => {
        proxyReq.removeHeader("origin");
      });
    },
  });

  return {
    "/v1": proxyFor(),
    "/auth": proxyFor(),
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = env.API_PROXY_TARGET?.trim();
  const apiBaseUrl = env.VITE_API_BASE_URL?.trim();
  const devServerPort = Number(env.DEV_SERVER_PORT) || 5173;

  if (mode === "production" && !apiBaseUrl) {
    throw new Error(
      "VITE_API_BASE_URL is required for production builds. Set it in the host/CI environment.",
    );
  }

  if (mode === "development" && !apiProxyTarget) {
    throw new Error(
      "API_PROXY_TARGET is required for the Vite proxy. Set it in the environment or .env.development.",
    );
  }

  const proxy = apiProxyTarget ? createApiProxy(apiProxyTarget) : undefined;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      port: devServerPort,
      proxy,
    },
    preview: {
      proxy,
    },
  };
});
