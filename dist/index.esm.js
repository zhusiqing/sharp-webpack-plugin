/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const sizeUnitConvert = (size) => {
    if (size === 0)
        return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + sizes[i];
};
const terminalColor = (color, text) => {
    const colors = {
        red: 31,
        green: 32,
        yellow: 33,
        blue: 34,
        magenta: 35,
        cyan: 36,
        white: 37,
    };
    const _color = colors[color];
    if (_color) {
        return `\u001b[${_color}m ${text} \u001b[0m`;
    }
    return text;
};

const sharp = require('sharp');
class SharpWebpackPlugin {
    constructor(options) {
        this.options = options;
        const { log = false, minSize = 300 * 1024, quality = 60, jpg = {}, png = {}, filter = () => true, } = options || {};
        this.log = log;
        this.minSize = minSize;
        this.quality = quality;
        this.jpg = Object.assign({}, jpg);
        this.png = Object.assign({}, png);
        this.filter = filter;
    }
    apply(compiler) {
        const arr = [];
        const compressedArr = [];
        const errArr = [];
        compiler.hooks.emit.tapAsync('image-webpack-plugin', (compilation, cb) => __awaiter(this, void 0, void 0, function* () {
            rootFor: for (const module of compilation.modules) {
                if (module.originalSource && module.originalSource()) {
                    const filename = module.resource || module.userRequest;
                    if (filename.endsWith('.png') ||
                        filename.endsWith('.jpg') ||
                        filename.endsWith('.jpeg')) {
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
                                        sharpSource = sharp(originAsset.source()).png(Object.assign({ palette: true, quality: this.quality }, this.png));
                                    }
                                    else {
                                        sharpSource = sharp(originAsset.source()).jpeg(Object.assign({ quality: this.quality }, this.jpg));
                                    }
                                    const buffer = yield sharpSource.toBuffer();
                                    originAsset.source = () => buffer;
                                    originAsset.size = () => buffer.length;
                                    compressedArr.push({
                                        name: key,
                                        size: buffer.length,
                                        filename,
                                        originalSize,
                                    });
                                }
                                catch (err) {
                                    errArr.push({ name: key, err, filename });
                                }
                            }
                        }
                    }
                }
            }
            if (this.log) {
                console.log('\n======= compress log start ========\n');
                console.log(`total/success items: ${arr.length}/${compressedArr.length}\n`);
                compressedArr.forEach(item => {
                    console.log(`compressed:${item.name} size: ${terminalColor('green', sizeUnitConvert(item.originalSize) +
                        ' => ' +
                        sizeUnitConvert(item.size))}`);
                });
                if (errArr.length) {
                    console.log(`\nerror items: ${errArr.length}`);
                    errArr.forEach(item => {
                        console.log(`${terminalColor('red', 'compressed error:')} ${item.name} ${item.err}`);
                    });
                }
                console.log('\n======= compress log end ========\n');
            }
            cb();
        }));
    }
}

export { SharpWebpackPlugin };
