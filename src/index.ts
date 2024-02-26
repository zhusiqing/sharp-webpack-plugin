const sharp = require('sharp')
import type { PngOptions, JpegOptions } from 'sharp'
import { sizeUnitConvert, terminalColor } from './utils'
import type { Compiler } from 'webpack'

interface OptionsType {
  log?: boolean;
  minSize?: number;
  quality?: number;
  jpg?: JpegOptions;
  png?: PngOptions;
  filter?: (file: string) => boolean;
}

interface compressedType {
  name: string;
  size: number;
  filename: string;
  originalSize: number;
}
interface errType {
  name: string;
  err: any;
  filename: string;
}

export class SharpWebpackPlugin {
  options: OptionsType;
  log: boolean;
  minSize: number;
  quality: number;
  jpg: JpegOptions;
  png: PngOptions;
  filter: (file: string) => boolean;
  constructor(options: OptionsType) {
    this.options = options;
    const {
      log = false,
      minSize = 300 * 1024,
      quality = 60,
      jpg = {},
      png = {},
      filter = () => true,
    } = options || {};
    this.log = log;
    this.minSize = minSize;
    this.quality = quality;
    this.jpg = { ...jpg };
    this.png = { ...png };
    this.filter = filter;
  }

  apply(compiler: Compiler) {
    const arr = [];
    const compressedArr: compressedType[] = [];
    const errArr: errType[] = [];
    compiler.hooks.emit.tapAsync(
      'image-webpack-plugin',
      async (compilation: any, cb: Function) => {
        rootFor: for (const module of compilation.modules) {
          if (module.originalSource && module.originalSource()) {
            const filename = module.resource || module.userRequest;
            if (
              filename.endsWith('.png') ||
              filename.endsWith('.jpg') ||
              filename.endsWith('.jpeg')
            ) {
              // 判断是否有引用
              if (module.buildInfo.assets) {
                for (const key of Object.keys(module.buildInfo.assets || {})) {
                  const originAsset = module.buildInfo.assets[key];
                  const originalSize = originAsset.size();
                  if (originalSize < this.minSize) {
                    continue rootFor;
                  }
                  if (!this.filter(filename)) {
                    continue rootFor;
                  }
                  arr.push({ name: key, size: originalSize });
                  try {
                    let sharpSource;
                    if (filename.endsWith('.png')) {
                      sharpSource = sharp(originAsset.source()).png({
                        palette: true,
                        quality: this.quality,
                        ...this.png,
                      });
                    } else {
                      sharpSource = sharp(originAsset.source()).jpeg({
                        quality: this.quality,
                        ...this.jpg,
                      });
                    }
                    const buffer = await sharpSource.toBuffer();
                    originAsset.source = () => buffer;
                    originAsset.size = () => buffer.length;
                    compressedArr.push({
                      name: key,
                      size: buffer.length,
                      filename,
                      originalSize,
                    });
                  } catch (err) {
                    errArr.push({ name: key, err, filename });
                  }
                }
              }
            }
          }
        }
        if (this.log) {
          console.log('\n======= compress log start ========\n');
          console.log(
            `total/success items: ${arr.length}/${compressedArr.length}\n`,
          );
          compressedArr.forEach(item => {
            console.log(
              `compressed:${item.name} size: ${terminalColor(
                'green',
                sizeUnitConvert(item.originalSize) +
                  ' => ' +
                  sizeUnitConvert(item.size),
              )}`,
            );
          });
          if (errArr.length) {
            console.log(`\nerror items: ${errArr.length}`);
            errArr.forEach(item => {
              console.log(
                `${terminalColor('red', 'compressed error:')} ${item.name} ${
                  item.err
                }`,
              );
            });
          }
          console.log('\n======= compress log end ========\n');
        }
        cb();
      },
    );
  }
};
