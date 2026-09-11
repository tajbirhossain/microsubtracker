import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const brandSvg = path.join(root, "assets", "brand", "logo-mark.svg");
const imagesDir = path.join(root, "assets", "images");

function readMarkSvg(rounded) {
  let svg = fs.readFileSync(brandSvg, "utf8");
  if (!rounded) {
    // Full-bleed square for Android 12+ splash (system applies its own mask).
    svg = svg.replace(/\s+rx="[^"]*"\s+ry="[^"]*"/, "");
  }
  return svg;
}

async function writePng(outFile, size, { rounded }) {
  const svg = readMarkSvg(rounded)
    .replace(/width="1024"/, `width="${size}"`)
    .replace(/height="1024"/, `height="${size}"`);

  let pipeline = sharp(Buffer.from(svg)).resize(size, size);

  if (rounded) {
    const radius = Math.round(size * 0.25);
    const mask = Buffer.from(
      `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
    );
    pipeline = pipeline.composite([{ input: mask, blend: "dest-in" }]);
  }

  await pipeline.png().toFile(path.join(imagesDir, outFile));
  console.log(`wrote ${outFile} (${size}px, rounded=${rounded})`);
}

// In-app / JS splash overlay — matches the SVG squircle.
await writePng("app-logo.png", 512, { rounded: true });

// Native Android splash — sharp full-bleed square (no transparent corners).
// Android 12+ masks this; pre-rounding caused cream gaps inside the system mask.
await writePng("splash-icon.png", 512, { rounded: false });
