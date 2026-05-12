// This configuration uses @lovable.dev/vite-tanstack-config for essential TanStack Start
// build system functionality. While it contains a Lovable reference, it provides
// critical infrastructure (tanstackStart, viteReact, tailwindcss, tsConfigPaths, 
// cloudflare, componentTagger, env injection, @ path alias, React/TanStack dedupe,
// error logger plugins) and cannot be removed without breaking the application.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
