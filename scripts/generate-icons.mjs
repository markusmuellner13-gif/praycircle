/**
 * One-off icon generation: renders scripts/icon.svg into the PNG sizes
 * required by the PWA manifest and iOS. Run: node scripts/generate-icons.mjs
 * (requires: npm i --no-save sharp)
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SVG = new URL("./icon.svg", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
mkdirSync("public/icons", { recursive: true });

const jobs = [
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 },
  { file: "public/icons/apple-touch-icon.png", size: 180 },
  { file: "src/app/icon.png", size: 64 },
];

for (const job of jobs) {
  await sharp(SVG).resize(job.size, job.size).png().toFile(job.file);
  console.log("wrote", job.file);
}

// Maskable: same art, scaled down onto a full-bleed background so the
// safe zone is respected.
const inner = await sharp(SVG).resize(400, 400).png().toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#10162a" },
})
  .composite([{ input: inner, top: 56, left: 56 }])
  .png()
  .toFile("public/icons/icon-maskable-512.png");
console.log("wrote public/icons/icon-maskable-512.png");
