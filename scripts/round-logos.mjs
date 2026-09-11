import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "assets", "images");

async function roundPng(file, radiusRatio = 0.25) {
  const input = path.join(dir, file);
  const meta = await sharp(input).metadata();
  const size = Math.min(meta.width || 1024, meta.height || 1024);
  const radius = Math.round(size * radiusRatio);
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
  );
  const tmp = path.join(dir, `${file}.tmp.png`);
  await sharp(input)
    .resize(size, size, { fit: "cover" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toFile(tmp);
  fs.renameSync(tmp, input);
  console.log(`rounded ${file} (${size}px, r=${radius})`);
}

await roundPng("app-logo.png", 0.25);
await roundPng("splash-icon.png", 0.25);
