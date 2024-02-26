import { JpegOptions, PngOptions } from 'sharp';
import { Compiler } from 'webpack';

interface OptionsType {
    log?: boolean;
    minSize?: number;
    quality?: number;
    jpg?: JpegOptions;
    png?: PngOptions;
    filter?: (file: string) => boolean;
}
declare class SharpWebpackPlugin {
    options: OptionsType;
    log: boolean;
    minSize: number;
    quality: number;
    jpg: JpegOptions;
    png: PngOptions;
    filter: (file: string) => boolean;
    constructor(options: OptionsType);
    apply(compiler: Compiler): void;
}

export { SharpWebpackPlugin };
