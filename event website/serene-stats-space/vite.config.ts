// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { createLogger, type Logger } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// The platform's bundled config injects vite-tsconfig-paths internally and offers no
// option to disable it. Vite 8 resolves tsconfig paths natively, so the plugin is
// redundant — but it cannot be removed from project code (Vite locks the plugin list
// before config hooks run). Filter just that deprecation warning, keep everything else.
function quietLogger(): Logger {
  const logger = createLogger();
  const warnOnce = logger.warnOnce.bind(logger);
  logger.warnOnce = (msg, options) => {
    if (msg.includes("vite-tsconfig-paths")) return;
    warnOnce(msg, options);
  };
  return logger;
}

export default defineConfig({
  vite: {
    customLogger: quietLogger(),
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
