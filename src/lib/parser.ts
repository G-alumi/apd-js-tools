import { inflateSync } from "node:zlib";
import type { ApdFile, ApdLayer, BlendMode } from "@/types/apd.js";

const MAGIC = "AZPDATA\0";

/** APD ファイルから1レイヤー分のデータを読み取る */
export function parseLayer(
  buf: Buffer,
  offset: number,
  metadataSize: number = 35
): { layer: ApdLayer; nextOffset: number } {
  // Name: 32 bytes, Shift-JIS, null-terminated
  const nameRaw = buf.subarray(offset, offset + 32);
  const nameEnd = nameRaw.indexOf(0);
  const nameSlice = nameRaw.subarray(0, nameEnd === -1 ? 32 : nameEnd);
  const name = new TextDecoder("shift_jis").decode(nameSlice);
  offset += 32;

  const blendMode = buf.readUInt8(offset++) as BlendMode;
  const opacity   = buf.readUInt8(offset++);
  const flags     = buf.readUInt8(offset++);
  const visible   = (flags & 0x01) !== 0;
  offset += metadataSize - 35; // forward-compat skip

  const compSize = buf.readUInt32LE(offset); offset += 4;

  const pixels = inflateSync(buf.subarray(offset, offset + compSize));
  offset += compSize;

  return { layer: { name, blendMode, opacity, visible, pixels }, nextOffset: offset };
}

/** APD ファイルのバイナリデータを解析して {@link ApdFile} を返す */
export function parseApd(buf: Buffer): ApdFile {
  if (buf.subarray(0, 8).toString("binary") !== MAGIC) {
    throw new Error("Not an AZPDATA file");
  }

  let offset = 8;

  // Main header
  const infoSize   = buf.readUInt32LE(offset); offset += 4;
  const width      = buf.readUInt16LE(offset); offset += 2;
  const height     = buf.readUInt16LE(offset); offset += 2;
  const layerCount = buf.readUInt16LE(offset); offset += 2;
  offset += 2; // layercnt (unused)
  offset += 2; // layersel (unused)
  offset += infoSize - 10; // forward-compat skip

  // Preview header
  offset += 4; // previewW, previewH (unused)
  const previewSize = buf.readUInt32LE(offset); offset += 4;

  // Preview data (BGRA, alpha unused)
  const preview = buf.subarray(offset, offset + previewSize);
  offset += previewSize;

  // Layer section header
  const layerinfosize = buf.readUInt32LE(offset); offset += 4;

  // Layers
  const layers: ApdLayer[] = [];
  for (let i = 0; i < layerCount; i++) {
    const { layer, nextOffset } = parseLayer(buf, offset, layerinfosize);
    layers.push(layer);
    offset = nextOffset;
  }

  return { width, height, layerCount, preview, layers };
}
