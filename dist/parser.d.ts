export interface ApdLayer {
    name: string;
    blendMode: number;
    opacity: number;
    visible: boolean;
    pixels: Buffer;
}
export interface ApdFile {
    width: number;
    height: number;
    layerCount: number;
    preview: Buffer;
    layers: ApdLayer[];
}
export declare function parseApd(buf: Buffer): ApdFile;
//# sourceMappingURL=parser.d.ts.map