import type { BlendMode } from "@/types/apd.js";

// ─── RGB↔HSL 変換 ────────────────────────────────────────────

/** RGB を AzPainter独自のHSL に変換する */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const fr = r / 255, fg = g / 255, fb = b / 255;
  const l = fr * 0.3 + fg * 0.59 + fb * 0.11;
  const max = Math.max(fr, fg, fb);
  const min = Math.min(fr, fg, fb);
  const s = max - min;
  if (s === 0) {
    // 無彩色の変な挙動を再現する
    let h = 0;
    if (r === 0 || (r & r - 1) === 0) {
      h = 0;
    } else if ((n => {const len = 32 - Math.clz32(n);return (n >> (len - 2)) === 3})(r)) {
      h = 1;
    } else {
      h = 4;
    }
    return [h, 0, l]
  };

  let h: number;
  if (fr === max) h = (fg - fb) / s;
  else if (fg === max) h = (fb - fr) / s + 2;
  else h = (fr - fg) / s + 4;
  if (h < 0) h += 6;

  return [h, s, l];
}

/** AzPainter独自のHSL を RGB に変換する */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (h < 0 || s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }

  let r: number, g: number, b: number;
  const hi = h % 6;
  if (hi <= 1) { b = -0.3 - h * 0.59; r = 1 + b; g = b + h; }
  else if (hi <= 2) { const hh = h - 2; b = -0.59 + hh * 0.3; r = b - hh; g = 1 + b; }
  else if (hi <= 3) { const hh = h - 2; r = -0.59 - hh * 0.11; g = 1 + r; b = r + hh; }
  else if (hi <= 4) { const hh = h - 4; r = -0.11 + hh * 0.59; g = r - hh; b = 1 + r; }
  else if (hi <= 5) { const hh = h - 4; g = -0.11 - hh * 0.3; r = g + hh; b = 1 + g; }
  else { const hh = h - 6; g = -0.3 + hh * 0.11; r = 1 + g; b = g - hh; }

  r *= s; g *= s; b *= s;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let x = 1;
  if (max + l > 1) x = Math.min(x, (1 - l) / max);
  if (min + l < 0) x = Math.min(x, l / (-min));

  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round((v * x + l) * 255)));
  return [clamp(r), clamp(g), clamp(b)];
}

// ─── ブレンド関数（src/dst: 0〜255、a: 0〜255） ─────────────────
// 戻り値: [outR, outG, outB, usedAlpha]
// usedAlpha=true → 関数内でa考慮済み（直接上書き）
// usedAlpha=false → 呼び出し側でアルファブレンドを適用

type BlendFn = (sr: number, sg: number, sb: number,
  dr: number, dg: number, db: number,
  a: number) => [number, number, number, boolean];

function ch(v: number) { return Math.min(255, Math.max(0, v)); }

const blendFns: Record<number, BlendFn> = {
  // 通常
  0x00: (sr, sg, sb) => [sr, sg, sb, false],

  // 乗算
  0x01: (sr, sg, sb, dr, dg, db) => [
    dr * sr / 255, dg * sg / 255, db * sb / 255, false,
  ],

  // 加算・発光 (LUM_ADD) ← a考慮済み
  0x02: (sr, sg, sb, dr, dg, db, a) => [
    ch(dr + sr * a / 255), ch(dg + sg * a / 255), ch(db + sb * a / 255), true,
  ],

  // 減算A (LUM_SUB) ← a考慮済み
  0x03: (sr, sg, sb, dr, dg, db, a) => [
    ch(dr - sr * a / 255), ch(dg - sg * a / 255), ch(db - sb * a / 255), true,
  ],

  // スクリーン
  0x04: (sr, sg, sb, dr, dg, db) => [
    sr + dr - sr * dr / 255, sg + dg - sg * dg / 255, sb + db - sb * db / 255, false,
  ],

  // オーバーレイ
  0x05: (sr, sg, sb, dr, dg, db) => {
    const f = (s: number, d: number) =>
      d < 128 ? s * d / 128 : 255 - (255 - d) * (255 - s) / 128;
    return [f(sr, dr), f(sg, dg), f(sb, db), false];
  },

  // ソフトライト
  0x06: (sr, sg, sb, dr, dg, db) => {
    const f = (s: number, d: number) => {
      const n = s * d / 255;
      return n + d * (255 - ((255 - s) * (255 - d) / 255) - n) / 255;
    };
    return [f(sr, dr), f(sg, dg), f(sb, db), false];
  },

  // ハードライト
  0x07: (sr, sg, sb, dr, dg, db) => {
    const f = (s: number, d: number) =>
      s < 128 ? s * d / 128 : 255 - (255 - d) * (255 - s) / 128;
    return [f(sr, dr), f(sg, dg), f(sb, db), false];
  },

  // 覆い焼き
  0x08: (sr, sg, sb, dr, dg, db) => {
    const f = (s: number, d: number) =>
      s === 255 ? 255 : ch((d * 255 / (255 - s)) | 0);
    return [f(sr, dr), f(sg, dg), f(sb, db), false];
  },

  // 焼き込み
  0x09: (sr, sg, sb, dr, dg, db) => {
    const f = (s: number, d: number) =>
      s === 0 ? 0 : ch(255 - (((255 - d) * 255 / s) | 0));
    return [f(sr, dr), f(sg, dg), f(sb, db), false];
  },

  // 焼き込みリニア
  0x0A: (sr, sg, sb, dr, dg, db) => [
    ch(sr + dr - 255), ch(sg + dg - 255), ch(sb + db - 255), false,
  ],

  // ビビッドライト
  0x0B: (sr, sg, sb, dr, dg, db) => {
    const f = (s: number, d: number) => {
      if (s < 128) {
        const n = 255 - s * 2;
        return (d <= n || s === 0) ? 0 : ch(((d - n) * 255 / (s * 2)) | 0);
      } else {
        const n = 255 * 2 - s * 2;
        return (d >= n || n === 0) ? 255 : ch((d * 255 / n) | 0);
      }
    };
    return [f(sr, dr), f(sg, dg), f(sb, db), false];
  },

  // リニアライト
  0x0C: (sr, sg, sb, dr, dg, db) => [
    ch(sr * 2 + dr - 255), ch(sg * 2 + dg - 255), ch(sb * 2 + db - 255), false,
  ],

  // ピンライト
  0x0D: (sr, sg, sb, dr, dg, db) => {
    const f = (s: number, d: number) =>
      s >= 128 ? Math.max(s * 2 - 255, d) : Math.min(s * 2, d);
    return [f(sr, dr), f(sg, dg), f(sb, db), false];
  },

  // 差の絶対値
  0x0E: (sr, sg, sb, dr, dg, db) => [
    Math.abs(dr - sr), Math.abs(dg - sg), Math.abs(db - sb), false,
  ],

  // 比較(明)
  0x0F: (sr, sg, sb, dr, dg, db) => [
    Math.max(sr, dr), Math.max(sg, dg), Math.max(sb, db), false,
  ],

  // 比較(暗)
  0x10: (sr, sg, sb, dr, dg, db) => [
    Math.min(sr, dr), Math.min(sg, dg), Math.min(sb, db), false,
  ],

  // 色相
  0x11: (sr, sg, sb, dr, dg, db) => {
    const [sh, ss] = rgbToHsl(sr, sg, sb);
    let [dh, ds, dl] = rgbToHsl(dr, dg, db);
    if (ss === 0) {
      ds = 0;
    } else {
      dh = sh;
    }
    const [r, g, b] = hslToRgb(dh, ds, dl);
    return [r, g, b, false];
  },


  // 彩度
  0x12: (sr, sg, sb, dr, dg, db) => {
    const [, ss] = rgbToHsl(sr, sg, sb);
    let [dh, ds, dl] = rgbToHsl(dr, dg, db);
    ds = ss;
    const [r, g, b] = hslToRgb(dh, ds, dl);
    return [r, g, b, false];
  },


  // カラー
  0x13: (sr, sg, sb, dr, dg, db) => {
    const [sh, ss] = rgbToHsl(sr, sg, sb);
    const dl = (dr * 0.3 + dg * 0.59 + db * 0.11) / 255;
    const [r, g, b] = hslToRgb(sh, ss, dl);
    return [r, g, b, false];
  },

  // 輝度
  0x14: (sr, sg, sb, dr, dg, db) => {
    const sl = (sr * 0.3 + sg * 0.59 + sb * 0.11) / 255;
    const [dh, ds] = rgbToHsl(dr, dg, db);
    const [r, g, b] = hslToRgb(dh, ds, sl);
    return [r, g, b, false];
  },
};

/**
 * src（上レイヤー）を dst（下レイヤー）にブレンドして dst を更新する。
 * pixels は BGRA 各8bit、width×height×4 バイト。
 */
export function blendLayers(
  dst: Buffer,
  src: Buffer,
  mode: BlendMode,
  opacity: number,   // 0〜128、128=100%
  debugCoord?: { x: number; y: number; width: number; height: number },
): void {
  const fn = blendFns[mode] ?? blendFns[0x00]!;
  // バッファは上下反転で渡されるため y を反転
  const debugIdx = debugCoord
    ? ((debugCoord.height - 1 - debugCoord.y) * debugCoord.width + debugCoord.x) * 4
    : -1;

  for (let i = 0; i < dst.length; i += 4) {
    const sa = src[i + 3]!;
    if (sa === 0) continue;

    const a = (sa * opacity) >> 7; // 0〜255
    if (a === 0) continue;

    // BGRA → RGB として渡す
    const sr = src[i + 2]!, sg = src[i + 1]!, sb = src[i]!;
    const dr = dst[i + 2]!, dg = dst[i + 1]!, db = dst[i]!;

    const [orF, ogF, obF, usedAlpha] = fn(sr, sg, sb, dr, dg, db, a);
    // 直接上書きパスは四捨五入、アルファブレンドパスは float のまま (256-a) 式に渡す
    const or = Math.round(orF), og = Math.round(ogF), ob = Math.round(obF);

    if (i === debugIdx) {
      const px = debugCoord!.x, py = debugCoord!.y;
      console.debug(`[blend debug] (${px},${py}) mode=0x${mode.toString(16).padStart(2, "0")} opacity=${opacity}`);
      console.debug(`  src RGBA: ${sr},${sg},${sb},${sa}  a(eff)=${a}`);
      console.debug(`  dst RGBA: ${dr},${dg},${db},${dst[i + 3]}`);
      console.debug(`  out RGB:  ${or},${og},${ob}  usedAlpha=${usedAlpha}`);
    }

    if (usedAlpha || a === 255) {
      dst[i] = ob; // B
      dst[i + 1] = og; // G
      dst[i + 2] = or; // R
    } else {
      // orF/ogF/obF を float のまま使う（整数化すると Math.round の境界でズレる）
      dst[i] = (Math.round((obF - db) * a / 255) + db) | 0; // B
      dst[i + 1] = (Math.round((ogF - dg) * a / 255) + dg) | 0; // G
      dst[i + 2] = (Math.round((orF - dr) * a / 255) + dr) | 0; // R
    }
    dst[i + 3] = 255;

    if (i === debugIdx) {
      console.debug(`  final dst RGB: ${dst[i + 2]},${dst[i + 1]},${dst[i]}`);
    }
  }
}
