// Build-time only (used from getStaticProps): reads width/height from PNG,
// GIF, JPEG and WebP headers in /public so <img> tags can reserve their space
// and avoid layout shift. No dependencies.
import fs from 'node:fs';
import path from 'node:path';

function readSize(buf) {
  // PNG
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // GIF
  if (buf.toString('ascii', 0, 3) === 'GIF') {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }
  // WebP (VP8X / VP8 / VP8L)
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
    if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    if (chunk === 'VP8L') {
      const b = buf.readUInt32LE(21);
      return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
    }
  }
  // JPEG: walk segments to the first SOFn marker
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      i += 2 + len;
    }
  }
  return null;
}

export function imageSize(src) {
  if (!src || !src.startsWith('/')) return null;
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public', src));
    return readSize(buf);
  } catch {
    return null;
  }
}

// Returns a copy of a project's sections with { width, height } on every image.
export function withImageSizes(sections = []) {
  const sized = (img) => (img?.src ? { ...img, ...(imageSize(img.src) || {}) } : img);
  return sections.map((block) => {
    if (block.type === 'image') return sized(block);
    if (block.type === 'gallery') return { ...block, items: block.items.map(sized) };
    if (block.type === 'split') return { ...block, image: sized(block.image) };
    return block;
  });
}
