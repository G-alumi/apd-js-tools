import { blendLayers } from "../lib/blend.js";
/** BGRA バッファを RGBA バッファに変換して返す */
export function bgraToRgba(pixels) {
    const out = Buffer.allocUnsafe(pixels.length);
    for (let i = 0; i < pixels.length; i += 4) {
        out[i] = pixels[i + 2]; // R
        out[i + 1] = pixels[i + 1]; // G
        out[i + 2] = pixels[i]; // B
        out[i + 3] = pixels[i + 3]; // A
    }
    return out;
}
/**
 * 全レイヤーを下から順に合成して BGRA バッファを返す。
 * 非表示レイヤーはスキップする。
 */
export function flattenApd(apd) {
    const size = apd.width * apd.height * 4;
    const dst = Buffer.alloc(size, 0);
    for (let i = 0; i < apd.layers.length; i++) {
        const layer = apd.layers[i];
        if (!layer.visible)
            continue;
        if (layer.opacity === 0)
            continue;
        console.log(layer.name);
        blendLayers(dst, layer.pixels, layer.blendMode, layer.opacity, { x: 698, y: 88, width: apd.width, height: apd.height });
    }
    return dst;
}
//# sourceMappingURL=image.js.map