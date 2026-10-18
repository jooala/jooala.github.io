// Creates optimized cover images for a project.
//
//   npm run cover -- <input-image> <slug> [--crop=left,top,width,height]
//
// Writes public/images/covers/<slug>.jpg (max 1600px wide) and
// public/images/covers/<slug>-sm.jpg (720px wide, used in archive grids).
// GIFs use their first frame.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [input, slug, ...flags] = process.argv.slice(2);

if (!input || !slug) {
  console.error('Usage: npm run cover -- <input-image> <slug> [--crop=left,top,width,height]');
  process.exit(1);
}

const cropFlag = flags.find((f) => f.startsWith('--crop='));
const crop = cropFlag
  ? Object.fromEntries(
      cropFlag.slice(7).split(',').map(Number).map((v, i) => [['left', 'top', 'width', 'height'][i], v])
    )
  : null;

const outDir = path.join(root, 'public', 'images', 'covers');

async function write(width, suffix) {
  let img = sharp(input, { animated: false });
  if (crop) img = img.extract(crop);
  const out = path.join(outDir, `${slug}${suffix}.jpg`);
  await img
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toFile(out);
  const meta = await sharp(out).metadata();
  console.log(`${path.relative(root, out)}  ${meta.width}x${meta.height}`);
}

await write(1600, '');
await write(720, '-sm');
