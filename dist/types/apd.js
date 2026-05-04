/** ブレンドモード（APD v1 g_v1_blendmode テーブル） */
export const BlendMode = {
    NORMAL: 0x00, // 通常
    MULTIPLY: 0x01, // 乗算
    ADD: 0x02, // 加算
    SUBTRACT: 0x03, // 減算
    SCREEN: 0x04, // スクリーン
    OVERLAY: 0x05, // オーバーレイ
    SOFT_LIGHT: 0x06, // ソフトライト
    HARD_LIGHT: 0x07, // ハードライト
    COLOR_DODGE: 0x08, // 覆い焼き
    COLOR_BURN: 0x09, // 焼き込み
    LINEAR_BURN: 0x0A, // 焼き込みリニア
    VIVID_LIGHT: 0x0B, // ビビッドライト
    LINEAR_LIGHT: 0x0C, // リニアライト
    PIN_LIGHT: 0x0D, // ピンライト
    DIFFERENCE: 0x0E, // 差の絶対値
    LIGHTEN: 0x0F, // 比較(明)
    DARKEN: 0x10, // 比較(暗)
    HUE: 0x11, // 色相
    SATURATION: 0x12, // 彩度
    COLOR: 0x13, // カラー
    LUMINOSITY: 0x14, // 輝度
};
//# sourceMappingURL=apd.js.map