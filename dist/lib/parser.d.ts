import type { ApdFile, ApdLayer } from "../types/apd.js";
/** APD ファイルから1レイヤー分のデータを読み取る */
export declare function parseLayer(buf: Buffer, offset: number, metadataSize?: number): {
    layer: ApdLayer;
    nextOffset: number;
};
/** APD ファイルのバイナリデータを解析して {@link ApdFile} を返す */
export declare function parseApd(buf: Buffer): ApdFile;
//# sourceMappingURL=parser.d.ts.map