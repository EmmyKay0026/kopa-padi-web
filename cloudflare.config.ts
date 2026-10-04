import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "web",
    entrypoint: "vinext/server/fetch-handler",

    compatibilityDate: "2026-10-01",
    compatibilityFlags: ["nodejs_compat"],

    assets: {
      notFoundHandling: "none",
    },

    domains: ["kopa-padi.corper-paddy.com.ng"],

    env: {
      ASSETS: bindings.assets(),

      NEXT_PUBLIC_API_URL: bindings.text(
        "https://api.kopa-padi.corper-paddy.com.ng",
      ),

      NEXT_PUBLIC_CIRCLE_POLL_INTERVAL_MS: bindings.text("5000"),
    },

    observability: {
      issues: {
        enabled: true,
      },

      logs: {
        enabled: true,
        headSamplingRate: 0.5,
        persist: false,
      },
    },
  }),
});
