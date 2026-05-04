# apd-js-tools

AzPainter（windows）の `.apd` ファイルを読み込む JavaScript/TypeScript 向けライブラリ・CLI ツールです。

## インストール

**Windows の場合**、[最新リリース](https://github.com/G-alumi/apd-js-tools/releases/latest) の `.tgz` ファイルを使ってインストールしてください。

```bash
npm install -g https://github.com/G-alumi/apd-js-tools/releases/latest/download/apd-js-tools-0.1.0.tgz
```

**Linux / macOS の場合**：

```bash
npm install -g github:G-alumi/apd-js-tools#v0.1.0
```

`-g` を付けてグローバルインストールすることで、`apd-js-tools` コマンドが使えるようになります。

## CLI

### レイヤーを PNG ファイルとして書き出す

各レイヤーを個別の PNG ファイルとして書き出します。

```bash
apd-js-tools layers-out <source.apd> <出力フォルダ>
```

オプション：
- `-D, --delete` — 書き出し前に出力フォルダの中身を削除する

### レイヤーを統合して PNG に書き出す

全レイヤーを統合し、1 枚の PNG として書き出します。

```bash
apd-js-tools merge-png <source.apd> [output.png]
```

`output.png` を省略した場合、ソースファイルと同じ場所に同名のpngファイルが出力されます。

## API

```ts
import { parseApd, flattenApd, bgraToRgba } from "apd-js-tools";
import { readFileSync } from "node:fs";

const apd = parseApd(readFileSync("file.apd"));
console.log(apd.width, apd.height, apd.layerCount);

const bgra = flattenApd(apd);
const rgba = bgraToRgba(bgra);
```

## ライセンス

MIT — [LICENSE](./LICENSE) を参照

[apdtool](https://gitlab.com/azelpg/apdtool)（Azel 著、MIT ライセンス）をもとに作成しています。
