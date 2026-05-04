import type { BlendMode } from "../types/apd.js";
/** RGB を AzPainter独自のHSL に変換する */
export declare function rgbToHsl(r: number, g: number, b: number): [number, number, number];
/** AzPainter独自のHSL を RGB に変換する */
export declare function hslToRgb(h: number, s: number, l: number): [number, number, number];
/**
 * src（上レイヤー）を dst（下レイヤー）にブレンドして dst を更新する。
 * pixels は BGRA 各8bit、width×height×4 バイト。
 */
export declare function blendLayers(dst: Buffer, src: Buffer, mode: BlendMode, opacity: number): void;
//# sourceMappingURL=blend.d.ts.map