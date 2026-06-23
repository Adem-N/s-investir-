import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Aligne l'alias `@/…` sur celui de tsconfig (`@/*` -> `./*`) pour que les
// tests puissent importer les modules via le même chemin que l'app.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
