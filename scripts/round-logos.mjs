import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const brandSvg = path.join(root, "assets", "brand", "logo-mark.svg");
const imagesDir = path.join(root, "assets", "images");

/**
 * Render the brand mark edge-to-edge with rounded corners (transparent outside).
 * No cream padding — splash backgroundColor handles that.
 */
async function writeRoundedMark(outFile, size, radiusRatio = 0.25) {
  const radius = Math.round(size * radiusRatio);
  const svg = fs
    .readFileSync(brandSvg, "utf8")
    .replace(/width="1024"/, `width="${size}"`)
    .replace(/height="1024"/, `height="${size}"`);

  const mark = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
  );

  await sharp(mark)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toFile(path.join(imagesDir, outFile));

  console.log(`wrote ${outFile} (${size}px, r=${radius})`);
}

await writeRoundedMark("app-logo.png", 512, 0.25);
await writeRoundedMark("splash-icon.png", 512, 0.25);
