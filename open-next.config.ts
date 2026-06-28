// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// Use in-memory cache instead of R2 to avoid 503 issues
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  // Disable R2 incremental cache for now
  // incrementalCache: r2IncrementalCache,
});
