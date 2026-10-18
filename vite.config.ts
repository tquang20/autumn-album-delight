// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "node:fs";
import path from "node:path";

function localPhotosPlugin() {
  const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp"]);

  function getFileSortKey(filename: string): [number, string] {
    const name = path.parse(filename).name;
    // Match trailing -<digits> suffix, e.g. "abc-3" → order 3
    const m = name.match(/-(\d+)$/);
    if (m) return [parseInt(m[1], 10), name];
    // No numeric suffix → sort after numbered ones, then alphabetically
    return [Infinity, name];
  }

  function scanFolder(dirPath: string, urlPrefix: string) {
    if (!fs.existsSync(dirPath)) return [];
    try {
      const files = fs.readdirSync(dirPath);
      return files
        .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
        .sort((a, b) => {
          const [aNum, aName] = getFileSortKey(a);
          const [bNum, bName] = getFileSortKey(b);
          if (aNum !== bNum) return aNum - bNum;
          return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: "base" });
        })
        .map((f) => {
          const name = path.parse(f).name;
          return {
            url: `${urlPrefix}/${encodeURIComponent(f)}`,
            name: name,
            filename: f,
          };
        });
    } catch {
      return [];
    }
  }

  return {
    name: "vite-plugin-local-photos",
    configureServer(server: any) {
      // 1. Serve /photos from photos/ or public/photos/
      server.middlewares.use("/photos", (req: any, res: any, next: any) => {
        const decodedUrl = decodeURIComponent(req.url || "").replace(/^\//, "");
        const rootPath = path.resolve(process.cwd(), "photos", decodedUrl);
        const publicPath = path.resolve(process.cwd(), "public", "photos", decodedUrl);

        let targetPath: string | null = null;
        if (fs.existsSync(rootPath) && fs.statSync(rootPath).isFile()) {
          targetPath = rootPath;
        } else if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
          targetPath = publicPath;
        }

        if (targetPath) {
          const ext = path.extname(targetPath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".avif": "image/avif",
          };
          res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
          fs.createReadStream(targetPath).pipe(res);
          return;
        }
        next();
      });

      // 2. API endpoint to list all photos
      server.middlewares.use("/api/local-photos", (_req: any, res: any) => {
        const folders = ["2024-2025", "2025-2026", "2026-2027"];
        const result: Record<string, any[]> = {};

        for (const f of folders) {
          const inRoot = scanFolder(path.resolve(process.cwd(), "photos", f), `/photos/${f}`);
          const inPublic = scanFolder(path.resolve(process.cwd(), "public", "photos", f), `/photos/${f}`);

          const seen = new Set<string>();
          const combined = [];
          for (const item of [...inRoot, ...inPublic]) {
            if (!seen.has(item.url)) {
              seen.add(item.url);
              combined.push(item);
            }
          }
          // Re-sort merged results by the same numeric-suffix rule
          combined.sort((a: any, b: any) => {
            const [aNum, aName] = getFileSortKey(a.filename);
            const [bNum, bName] = getFileSortKey(b.filename);
            if (aNum !== bNum) return aNum - bNum;
            return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: "base" });
          });
          result[f] = combined;
        }

        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(result));
      });

      // 3. Watch folders for live updates
      const rootPhotos = path.resolve(process.cwd(), "photos");
      const publicPhotos = path.resolve(process.cwd(), "public/photos");

      if (fs.existsSync(rootPhotos)) server.watcher.add(rootPhotos);
      if (fs.existsSync(publicPhotos)) server.watcher.add(publicPhotos);

      const onPhotoChange = (file: string) => {
        if (file.includes("photos") && IMAGE_EXTS.has(path.extname(file).toLowerCase())) {
          server.ws.send({
            type: "custom",
            event: "photos-updated",
            data: {},
          });
        }
      };

      server.watcher.on("add", onPhotoChange);
      server.watcher.on("unlink", onPhotoChange);
      server.watcher.on("change", onPhotoChange);
    },
  };
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [localPhotosPlugin()],
  },
});
