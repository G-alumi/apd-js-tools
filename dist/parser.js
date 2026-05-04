import { inflateSync } from "node:zlib";
const MAGIC = "AZPDATA\0";
export function parseApd(buf) {
    // Verify magic
    if (buf.subarray(0, 8).toString("binary") !== MAGIC) {
        throw new Error("Not an AZPDATA file");
    }
    let offset = 8;
    // Main header
    const infoSize = buf.readUInt32LE(offset);
    offset += 4;
    const width = buf.readUInt16LE(offset);
    offset += 2;
    const height = buf.readUInt16LE(offset);
    offset += 2;
    const layerCount = buf.readUInt16LE(offset);
    offset += 2;
    offset += 2; // layercnt (unused)
    offset += 2; // layersel (unused)
    offset += infoSize - 10; // forward-compat skip
    // Preview header
    const previewW = buf.readUInt16LE(offset);
    offset += 2;
    const previewH = buf.readUInt16LE(offset);
    offset += 2;
    const previewSize = buf.readUInt32LE(offset);
    offset += 4;
    // Preview data (BGRA, alpha unused)
    const preview = buf.subarray(offset, offset + previewSize);
    offset += previewSize;
    // Layer section header
    const layerinfosize = buf.readUInt32LE(offset);
    offset += 4;
    const extraSkip = layerinfosize - 35;
    // Layers
    const layers = [];
    for (let i = 0; i < layerCount; i++) {
        // Name: 32 bytes, Shift-JIS, null-terminated
        const nameRaw = buf.subarray(offset, offset + 32);
        const nameEnd = nameRaw.indexOf(0);
        const nameSlice = nameRaw.subarray(0, nameEnd === -1 ? 32 : nameEnd);
        const name = new TextDecoder("shift_jis").decode(nameSlice);
        offset += 32;
        const blendMode = buf.readUInt8(offset++);
        const opacity = buf.readUInt8(offset++);
        const flags = buf.readUInt8(offset++);
        const visible = (flags & 0x01) !== 0;
        offset += extraSkip;
        const compSize = buf.readUInt32LE(offset);
        offset += 4;
        const compressed = buf.subarray(offset, offset + compSize);
        const pixels = inflateSync(compressed);
        offset += compSize;
        layers.push({ name, blendMode, opacity, visible, pixels });
    }
    return { width, height, layerCount, preview, layers };
}
//# sourceMappingURL=parser.js.map