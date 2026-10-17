// Builds the Meskan icon assets from the source PNG (the house/spiral mark alone),
// with no dependencies (zlib only). The brand name is rendered as live text next to the icon
// (BrandLogo.jsx) so it can read "Meskan" or «مسكن» depending on the language.
//   public/brand/meskan-mark.png        icon, navy on transparent, square
//   public/brand/meskan-mark-white.png  same in white (dark backgrounds, e.g. footer)
//   src/app/icon.png                    favicon (Next.js app icon convention)
//   src/app/apple-icon.png              iOS home-screen icon
//
// Usage: node scripts/make-logo.cjs <icon.png>
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const src = process.argv[2];
if (!src) throw new Error('Usage: node scripts/make-logo.cjs <source.png>');
const out = path.join(__dirname, '..', 'frontend');

// ── PNG decode (8-bit RGB/RGBA, non-interlaced) ────────────────
function decode(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('Not a PNG');
  let pos = 8, width, height, colorType, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[12] !== 0) throw new Error('Only 8-bit non-interlaced PNG supported');
      colorType = data[9];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!bpp) throw new Error(`Unsupported color type ${colorType}`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const px = Buffer.alloc(width * height * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const pred = f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : f === 4 ? (pa <= pb && pa <= pc ? a : pb <= pc ? b : c) : 0;
      line[i] = (line[i] + pred) & 0xff;
    }
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      px[o] = line[x * bpp]; px[o + 1] = line[x * bpp + 1]; px[o + 2] = line[x * bpp + 2];
      px[o + 3] = bpp === 4 ? line[x * bpp + 3] : 255;
    }
    prev = line;
  }
  return { width, height, px };
}

// ── PNG encode (RGBA, filter 0) ─────────────────────────────────
const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = (b) => { let c = -1; for (const v of b) c = CRC[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encode({ width, height, px }) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) px.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ── Image ops ───────────────────────────────────────────────────
const NAVY = [15, 23, 42]; // matches the site's brand-500 (#0f172a)

/** White/light background → transparent; ink pixels → solid colour with anti-aliased alpha. */
function toInk(img, [r, g, b]) {
  const px = Buffer.alloc(img.px.length);
  for (let i = 0; i < img.px.length; i += 4) {
    const lum = (img.px[i] * 0.299 + img.px[i + 1] * 0.587 + img.px[i + 2] * 0.114) / 255;
    const ink = Math.max(0, Math.min(1, (0.92 - lum) / 0.72)) * (img.px[i + 3] / 255);
    px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = Math.round(ink * 255);
  }
  return { ...img, px };
}

function bbox(img, x0 = 0, x1 = img.width) {
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  for (let y = 0; y < img.height; y++) for (let x = x0; x < x1; x++) {
    if (img.px[(y * img.width + x) * 4 + 3] > 24) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  return { minX, minY, maxX, maxY };
}

function crop(img, { minX, minY, maxX, maxY }, pad = 0, square = false) {
  let w = maxX - minX + 1 + pad * 2, h = maxY - minY + 1 + pad * 2, ox = minX - pad, oy = minY - pad;
  if (square) { const s = Math.max(w, h); ox -= (s - w) >> 1; oy -= (s - h) >> 1; w = h = s; }
  const px = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = x + ox, sy = y + oy;
    if (sx < 0 || sy < 0 || sx >= img.width || sy >= img.height) continue;
    img.px.copy(px, (y * w + x) * 4, (sy * img.width + sx) * 4, (sy * img.width + sx) * 4 + 4);
  }
  return { width: w, height: h, px };
}

/** Box-filter downscale (keeps edges smooth for the favicon). */
function resize(img, size) {
  const px = Buffer.alloc(size * size * 4), sx = img.width / size, sy = img.height / size;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let acc = [0, 0, 0, 0], n = 0;
    for (let yy = Math.floor(y * sy); yy < Math.floor((y + 1) * sy); yy++) for (let xx = Math.floor(x * sx); xx < Math.floor((x + 1) * sx); xx++) {
      const o = (yy * img.width + xx) * 4, a = img.px[o + 3];
      acc[0] += img.px[o] * a; acc[1] += img.px[o + 1] * a; acc[2] += img.px[o + 2] * a; acc[3] += a; n++;
    }
    const o = (y * size + x) * 4;
    if (acc[3]) { px[o] = acc[0] / acc[3]; px[o + 1] = acc[1] / acc[3]; px[o + 2] = acc[2] / acc[3]; }
    px[o + 3] = n ? acc[3] / n : 0;
  }
  return { width: size, height: size, px };
}

/** First fully empty column gap after the mark = boundary between mark and wordmark. */
function markEnd(img, box) {
  let seenInk = false;
  for (let x = box.minX; x <= box.maxX; x++) {
    let ink = false;
    for (let y = box.minY; y <= box.maxY && !ink; y++) ink = img.px[(y * img.width + x) * 4 + 3] > 24;
    if (ink) seenInk = true;
    else if (seenInk) return x;
  }
  return box.maxX + 1;
}

// ── Build ───────────────────────────────────────────────────────
const source = decode(fs.readFileSync(src));
const navy = toInk(source, NAVY);
const mark = crop(navy, bbox(navy), 6, true); // square frame, small margin
const white = { ...mark, px: Buffer.from(mark.px) };
for (let i = 0; i < white.px.length; i += 4) white.px[i] = white.px[i + 1] = white.px[i + 2] = 255;

fs.mkdirSync(path.join(out, 'public', 'brand'), { recursive: true });
const write = (rel, img) => { fs.writeFileSync(path.join(out, rel), encode(img)); console.log(`${rel}  ${img.width}x${img.height}`); };
write('public/brand/meskan-mark.png', mark);
write('public/brand/meskan-mark-white.png', white);
write('src/app/icon.png', resize(mark, 64));
write('src/app/apple-icon.png', resize(mark, 180));
