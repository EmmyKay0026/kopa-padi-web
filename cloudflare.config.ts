import { bindings, defineConfig, defineWorker } from "cf/config";
import { previewBuildTarget } from "./lib/staging-target.mjs";

export default defineConfig(({ isPreview }) => ({
  worker: defineWorker({
    name: "web",
    entrypoint: "vinext/server/fetch-handler",

    compatibilityDate: "2026-10-01",
    compatibilityFlags: ["nodejs_compat"],

    assets: {
      notFoundHandling: "none",
    },

    ...(isPreview
      ? {}
      : {
          domains: ["kopa-padi.com.ng"],
        }),

    env: {
      ASSETS: bindings.assets(),

      NEXT_PUBLIC_API_URL: bindings.text(
        isPreview
          ? previewBuildTarget(
              process.env.STAGING_API_URL,
              process.env.NEXT_PUBLIC_API_URL,
            )
          : "https://api.kopa-padi.com.ng",
      ),

      NEXT_PUBLIC_CIRCLE_POLL_INTERVAL_MS: bindings.text("5000"),

      NEXT_PUBLIC_GOOGLE_AUTH_ENABLED: bindings.text("true"),
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
}));
