import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const YANDEX_DISK_API = "https://cloud-api.yandex.net/v1/disk";

function requiredEnv(name) {
  const value = globalThis.process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function joinDiskPath(base, relative) {
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedRel = relative.replace(/^\/+/, "");
  return `${normalizedBase}/${normalizedRel}`;
}

function normalizeRelativePosixPath(value) {
  const input = value.replace(/\\/g, "/");
  const normalized = path.posix.normalize(input);

  if (normalized.includes(":")) return null;
  if (normalized.startsWith("../") || normalized === "..") return null;
  if (path.posix.isAbsolute(normalized)) return null;
  if (!normalized || normalized === ".") return null;

  return normalized;
}

async function yandexApiRequestJson(token, url) {
  const response = await globalThis.fetch(url, {
    headers: {
      Authorization: `OAuth ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Yandex.Disk API error ${response.status} ${response.statusText}: ${body}`,
    );
  }

  return response.json();
}

async function getDownloadHref(token, diskPath) {
  const url = new globalThis.URL(`${YANDEX_DISK_API}/resources/download`);
  url.searchParams.set("path", diskPath);

  const data = await yandexApiRequestJson(token, url);

  if (!data || typeof data !== "object" || typeof data.href !== "string") {
    throw new Error(`Unexpected download response for ${diskPath}`);
  }

  return data.href;
}

async function downloadTextFile(token, diskPath) {
  const href = await getDownloadHref(token, diskPath);

  const response = await globalThis.fetch(href, {
    headers: {
      Authorization: `OAuth ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Download error ${response.status} ${response.statusText} for ${diskPath}: ${body}`,
    );
  }

  return response.text();
}

async function downloadBinaryFileTo(token, diskPath, localPath) {
  const href = await getDownloadHref(token, diskPath);

  const response = await globalThis.fetch(href, {
    headers: {
      Authorization: `OAuth ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Download error ${response.status} ${response.statusText} for ${diskPath}: ${body}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, globalThis.Buffer.from(arrayBuffer));
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateAchievementsJson(data) {
  if (!Array.isArray(data)) {
    throw new Error("achievements.json must be an array");
  }

  const allowedIcons = new Set(["trophy", "badge", "sparkles", "graduation"]);

  for (const [index, item] of data.entries()) {
    if (!isRecord(item)) {
      throw new Error(`Achievement[${index}] must be an object`);
    }

    if (typeof item.title !== "string" || !item.title.trim()) {
      throw new Error(`Achievement[${index}].title must be a non-empty string`);
    }

    if (typeof item.description !== "string" || !item.description.trim()) {
      throw new Error(
        `Achievement[${index}].description must be a non-empty string`,
      );
    }

    if (typeof item.date !== "string" || !item.date.trim()) {
      throw new Error(`Achievement[${index}].date must be a non-empty string`);
    }

    if (item.icon !== undefined) {
      if (typeof item.icon !== "string" || !allowedIcons.has(item.icon)) {
        throw new Error(
          `Achievement[${index}].icon must be one of: ${Array.from(
            allowedIcons,
          ).join(", ")}`,
        );
      }
    }

    if (item.media !== undefined) {
      if (!Array.isArray(item.media)) {
        throw new Error(`Achievement[${index}].media must be an array`);
      }

      for (const [mediaIndex, media] of item.media.entries()) {
        if (!isRecord(media)) {
          throw new Error(
            `Achievement[${index}].media[${mediaIndex}] must be an object`,
          );
        }

        if (typeof media.label !== "string" || !media.label.trim()) {
          throw new Error(
            `Achievement[${index}].media[${mediaIndex}].label must be a non-empty string`,
          );
        }

        const hasHref = typeof media.href === "string" && Boolean(media.href);
        const hasFile = typeof media.file === "string" && Boolean(media.file);

        if (!hasHref && !hasFile) {
          throw new Error(
            `Achievement[${index}].media[${mediaIndex}] must have either href or file`,
          );
        }

        if (hasFile) {
          const normalized = normalizeRelativePosixPath(media.file);
          if (!normalized) {
            throw new Error(
              `Achievement[${index}].media[${mediaIndex}].file is not a valid relative path`,
            );
          }
        }

        if (media.type !== undefined) {
          const allowedTypes = new Set(["image", "pdf", "link"]);
          if (typeof media.type !== "string" || !allowedTypes.has(media.type)) {
            throw new Error(
              `Achievement[${index}].media[${mediaIndex}].type must be one of: ${Array.from(
                allowedTypes,
              ).join(", ")}`,
            );
          }
        }
      }
    }
  }

  return data;
}

function collectMediaFiles(achievements) {
  const files = new Set();

  for (const achievement of achievements) {
    if (!achievement.media) continue;

    for (const media of achievement.media) {
      if (media && typeof media.file === "string" && media.file) {
        const normalized = normalizeRelativePosixPath(media.file);
        if (normalized) {
          files.add(normalized);
        }
      }
    }
  }

  return files;
}

async function main() {
  const token = requiredEnv("YANDEX_DISK_TOKEN");

  const rawRemoteDir = globalThis.process.env.YANDEX_DISK_ACHIEVEMENTS_DIR;
  const remoteDir =
    rawRemoteDir && rawRemoteDir.trim() ? rawRemoteDir.trim() : null;

  const rawRemoteJsonPath =
    globalThis.process.env.YANDEX_DISK_ACHIEVEMENTS_JSON_PATH;
  const remoteJsonPath =
    rawRemoteJsonPath && rawRemoteJsonPath.trim()
      ? rawRemoteJsonPath.trim()
      : remoteDir
        ? joinDiskPath(remoteDir, "achievements.json")
        : null;

  if (!remoteJsonPath) {
    throw new Error(
      "Set YANDEX_DISK_ACHIEVEMENTS_DIR or YANDEX_DISK_ACHIEVEMENTS_JSON_PATH",
    );
  }

  const localSitePath = path.join(
    repoRoot,
    "src",
    "shared",
    "content",
    "site.json",
  );

  const localMediaRoot = path.join(repoRoot, "public", "achievements");
  const localMediaTempRoot = path.join(
    repoRoot,
    "public",
    "achievements.__tmp__",
  );

  const jsonText = await downloadTextFile(token, remoteJsonPath);
  const parsed = validateAchievementsJson(JSON.parse(jsonText));

  const normalized = parsed.map((achievement) => {
    if (!achievement.media) return achievement;

    return {
      ...achievement,
      media: achievement.media.map((media) => {
        if (!media || typeof media !== "object") return media;
        if (typeof media.file !== "string" || !media.file) return media;

        const normalizedFile = normalizeRelativePosixPath(media.file);
        if (!normalizedFile) return media;

        return {
          ...media,
          file: normalizedFile,
        };
      }),
    };
  });

  const siteText = await fs.readFile(localSitePath, "utf8");
  const siteData = JSON.parse(siteText);

  if (!isRecord(siteData)) {
    throw new Error("site.json must be an object");
  }

  siteData.achievements = normalized;
  const formatted = `${JSON.stringify(siteData, null, 2)}\n`;

  const mediaFiles = collectMediaFiles(normalized);

  if (mediaFiles.size > 0 && !remoteDir) {
    throw new Error(
      "YANDEX_DISK_ACHIEVEMENTS_DIR is required to download media files",
    );
  }

  await fs.rm(localMediaTempRoot, { recursive: true, force: true });
  await fs.mkdir(localMediaTempRoot, { recursive: true });

  for (const relativePath of mediaFiles) {
    const remotePath = joinDiskPath(remoteDir, relativePath);
    const localPath = path.resolve(
      localMediaTempRoot,
      ...relativePath.split("/"),
    );

    const rel = path.relative(localMediaTempRoot, localPath);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new Error(
        `Resolved path is outside media directory: ${relativePath}`,
      );
    }

    await downloadBinaryFileTo(token, remotePath, localPath);
  }

  await fs.rm(localMediaRoot, { recursive: true, force: true });
  await fs.rename(localMediaTempRoot, localMediaRoot);

  await fs.mkdir(path.dirname(localSitePath), { recursive: true });
  await fs.writeFile(localSitePath, formatted, "utf8");

  globalThis.process.stdout.write(
    `Synced site.json and ${mediaFiles.size} media file(s).\n`,
  );
}

main().catch((error) => {
  globalThis.process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  globalThis.process.exitCode = 1;
});
