import type { ApdFile } from "../types/apd.js";
/** BGRA バッファを RGBA バッファに変換して返す */
export declare function bgraToRgba(pixels: Buffer): Buffer;
/**
 * 全レイヤーを下から順に合成して BGRA バッファを返す。
 * 非表示レイヤーはスキップする。
 */
export declare function flattenApd(apd: ApdFile): Buffer;
//# sourceMappingURL=image.d.ts.map