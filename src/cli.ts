#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { Command } from "commander";
import { parseApd } from "@/lib/parser.js";
import { bgraToRgba, flattenApd } from "@/lib/image.js";
import sharp from "sharp";
import { join } from "node:path";

const program = new Command();

program
  .name("apd-jsTool")
  .description("AzPainter APD file exporter");

program
  .command("layers-out")
  .description("Export .apd files as PNGs, one layer per file")
  .argument("<source>", "path to .apd file")
  .argument("<output>", "output layer PNG files folder path")
  .option("-D, --delete", "clear output folder contents before exporting")
  .action(async(source: string, output: string, opts: { delete?: boolean }) => {
    const apd = parseApd(readFileSync(source));

    if (opts.delete && existsSync(output)) {
      for (const entry of readdirSync(output)) {
        rmSync(join(output, entry), { recursive: true, force: true });
      }
    }
    if (!existsSync(output)) {
      mkdirSync(output, {recursive: true});
    }
    
    const digits = String(apd.layerCount).length;
    let sequence = 1;
    for (const layer of apd.layers) {
      const pixels = bgraToRgba(layer.pixels);
      await sharp(pixels, {
        raw: {width:apd.width,height:apd.height,channels:4}
      }).flip().png().toFile(join(output, `${String(sequence).padStart(digits, "0")}_${layer.name}.png`))
      sequence += 1;
    }
  });

program
  .command("merge-png")
  .description("Merge APD layers and export as PNG")
  .argument("<source>", "path to .apd file")
  .argument("[output]", "output PNG file path (default: source with .png extension)")
  .action(async (source: string, output?: string) => {
    const dest = output ?? source.replace(/\.[^.]+$/, "") + ".png";
    const apd = parseApd(readFileSync(source));
    const bgra = flattenApd(apd);
    const rgba = bgraToRgba(bgra);
    await sharp(rgba, {
      raw: { width: apd.width, height: apd.height, channels: 4 }
    }).flip().png().toFile(dest);
  });

if (process.argv.length === 2) program.help();

program.parse();
