/** APD ファイル全体を表すデータ */
export interface ApdFile {
    width: number;
    height: number;
    layerCount: number;
    /** BGRA、90×68、アルファ未使用 */
    preview: Buffer;
    layers: ApdLayer[];
}
/** ブレンドモード（APD v1 g_v1_blendmode テーブル） */
export declare const BlendMode: {
    readonly NORMAL: 0;
    readonly MULTIPLY: 1;
    readonly ADD: 2;
    readonly SUBTRACT: 3;
    readonly SCREEN: 4;
    readonly OVERLAY: 5;
    readonly SOFT_LIGHT: 6;
    readonly HARD_LIGHT: 7;
    readonly COLOR_DODGE: 8;
    readonly COLOR_BURN: 9;
    readonly LINEAR_BURN: 10;
    readonly VIVID_LIGHT: 11;
    readonly LINEAR_LIGHT: 12;
    readonly PIN_LIGHT: 13;
    readonly DIFFERENCE: 14;
    readonly LIGHTEN: 15;
    readonly DARKEN: 16;
    readonly HUE: 17;
    readonly SATURATION: 18;
    readonly COLOR: 19;
    readonly LUMINOSITY: 20;
};
export type BlendMode = typeof BlendMode[keyof typeof BlendMode];
/** APD ファイルの1レイヤーを表すデータ */
export interface ApdLayer {
    name: string;
    blendMode: BlendMode;
    /** 0〜128、128 = 100% */
    opacity: number;
    visible: boolean;
    /** BGRA、下から上順、width×height×4 バイト */
    pixels: Buffer;
}
//# sourceMappingURL=apd.d.ts.map