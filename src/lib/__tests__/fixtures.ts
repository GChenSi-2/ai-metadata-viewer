// Synthetic PNG builder used by tests. Produces a minimal valid PNG with given tEXt chunks.
// We don't bother with real pixel data — just IHDR + tEXt(s) + IEND. CRC is computed correctly.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const out = new Uint8Array(8 + data.length + 4);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  out.set(typeBytes, 4);
  out.set(data, 8);
  const crcInput = new Uint8Array(typeBytes.length + data.length);
  crcInput.set(typeBytes, 0);
  crcInput.set(data, typeBytes.length);
  dv.setUint32(8 + data.length, crc32(crcInput));
  return out;
}

function ihdr(width: number, height: number): Uint8Array {
  const data = new Uint8Array(13);
  const dv = new DataView(data.buffer);
  dv.setUint32(0, width);
  dv.setUint32(4, height);
  data[8] = 8;  // bit depth
  data[9] = 2;  // color type RGB
  data[10] = 0; // compression
  data[11] = 0; // filter
  data[12] = 0; // interlace
  return chunk("IHDR", data);
}

function textChunk(key: string, value: string): Uint8Array {
  // tEXt is Latin-1 in spec but most tools (a1111) write UTF-8 anyway; we use UTF-8 encode.
  const enc = new TextEncoder();
  const k = enc.encode(key);
  const v = enc.encode(value);
  const data = new Uint8Array(k.length + 1 + v.length);
  data.set(k, 0);
  data[k.length] = 0;
  data.set(v, k.length + 1);
  return chunk("tEXt", data);
}

const PNG_SIG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function buildPngWithText(
  textEntries: Array<[string, string]>,
  width = 64,
  height = 64,
): ArrayBuffer {
  const parts: Uint8Array[] = [PNG_SIG, ihdr(width, height)];
  for (const [k, v] of textEntries) parts.push(textChunk(k, v));
  parts.push(chunk("IEND", new Uint8Array(0)));

  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out.buffer;
}

export function bufferToFile(buf: ArrayBuffer, name = "test.png"): File {
  return new File([buf], name, { type: "image/png" });
}
