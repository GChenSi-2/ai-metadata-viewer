// PNG file structure: 8-byte signature + sequence of chunks.
// Each chunk: [4-byte length BE][4-byte type ASCII][data][4-byte CRC]
// tEXt chunk data: keyword\0text (Latin-1)
// iTXt chunk data: keyword\0 compressionFlag(1) compressionMethod(1) langTag\0 translatedKeyword\0 text (UTF-8)
// zTXt chunk data: keyword\0 compressionMethod(1) compressedText (we attempt decompression via DecompressionStream)

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export interface PngChunks {
  text: Record<string, string>;
  width: number;
  height: number;
}

function readAscii(view: DataView, offset: number, length: number): string {
  let s = "";
  for (let i = 0; i < length; i++) s += String.fromCharCode(view.getUint8(offset + i));
  return s;
}

async function inflate(data: Uint8Array): Promise<string> {
  // zlib (deflate) — use DecompressionStream when available (modern browsers + Node 18+)
  const ds = new DecompressionStream("deflate");
  const stream = new Blob([new Uint8Array(data)]).stream().pipeThrough(ds);
  const buf = await new Response(stream).arrayBuffer();
  return new TextDecoder("utf-8").decode(buf);
}

export async function parsePngChunks(buffer: ArrayBuffer): Promise<PngChunks> {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) throw new Error("Not a PNG file");
  }

  const text: Record<string, string> = {};
  let width = 0;
  let height = 0;

  let offset = 8;
  while (offset + 8 <= buffer.byteLength) {
    const length = view.getUint32(offset);
    const type = readAscii(view, offset + 4, 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd > buffer.byteLength) break;

    if (type === "IHDR") {
      width = view.getUint32(dataStart);
      height = view.getUint32(dataStart + 4);
    } else if (type === "tEXt") {
      const slice = bytes.subarray(dataStart, dataEnd);
      const nullIdx = slice.indexOf(0);
      if (nullIdx > 0) {
        const key = new TextDecoder("latin1").decode(slice.subarray(0, nullIdx));
        const value = new TextDecoder("latin1").decode(slice.subarray(nullIdx + 1));
        text[key] = value;
      }
    } else if (type === "iTXt") {
      const slice = bytes.subarray(dataStart, dataEnd);
      const nullIdx = slice.indexOf(0);
      if (nullIdx > 0 && nullIdx + 2 < slice.length) {
        const key = new TextDecoder("utf-8").decode(slice.subarray(0, nullIdx));
        const compressionFlag = slice[nullIdx + 1];
        // skip compression method byte at nullIdx+2
        let p = nullIdx + 3;
        // language tag
        const langEnd = slice.indexOf(0, p);
        if (langEnd < 0) { offset = dataEnd + 4; continue; }
        p = langEnd + 1;
        // translated keyword
        const trEnd = slice.indexOf(0, p);
        if (trEnd < 0) { offset = dataEnd + 4; continue; }
        p = trEnd + 1;
        const payload = slice.subarray(p);
        if (compressionFlag === 0) {
          text[key] = new TextDecoder("utf-8").decode(payload);
        } else {
          try {
            text[key] = await inflate(payload);
          } catch {
            // skip undecodable
          }
        }
      }
    } else if (type === "zTXt") {
      const slice = bytes.subarray(dataStart, dataEnd);
      const nullIdx = slice.indexOf(0);
      if (nullIdx > 0 && nullIdx + 1 < slice.length) {
        const key = new TextDecoder("latin1").decode(slice.subarray(0, nullIdx));
        const payload = slice.subarray(nullIdx + 2); // skip compressionMethod byte
        try {
          text[key] = await inflate(payload);
        } catch {
          // skip undecodable
        }
      }
    } else if (type === "IEND") {
      break;
    }

    offset = dataEnd + 4; // +4 for CRC
  }

  return { text, width, height };
}
