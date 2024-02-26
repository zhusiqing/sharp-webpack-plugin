
# sharp-webpack-plugin

> 基于sharp图片压缩的webpack插件

目前只支持png、jpg、jpeg格式的图片压缩

## 依赖

`webpack >= 4.0.0`
`node >= 14.0.0`
`sharp = 0.32.6`

> 因为要兼容webpack4和node14，所以sharp的版本锁定在0.32.6

## 安装

```bash
# npm
npm install -D sharp-webpack-plugin
# yarn
yarn add -D sharp-webpack-plugin
# pnpm
pnpm add -D sharp-webpack-plugin
```

国内安装时，可能会因为某种原因安装失败，这里可以将sharp的二进制源更换为国内镜像源

`sharp@0.32.6`对应的`sharp-libvips`版本为`8.14.5`

```bash
# .npmrc
registry=https://registry.npmmirror.com
SHARP_DIST_BASE_URL=https://registry.npmmirror.com/-/binary/sharp-libvips/v8.14.5/
```

## 使用

```js
  const { sharpWebpackPlugin } = require('sharp-webpack-plugin');
  module.exports = {
    plugin: [
      new sharpWebpackPlugin()
    ]
  }
```

## 配置参数(Options)

#### Options.quality: number

统一的图片压缩质量，范围是0-100，默认为60

#### Options.minSize: number

统一的图片压缩最小尺寸，单位为B，默认为300 * 1024(300KB)

#### Options.log: boolean

是否打印压缩日志，默认为false

#### Options.filter: (filename: string) => boolean

过滤器，可以自定义过滤规则，只对符合过滤规则的文件进行压缩，函数的第一个参数为图片的路径地址加文件名，函数返回true表示需要压缩，false表示不压缩，默认为不过滤

#### Options.png: sharp.PngOptions

png压缩配置，参考[sharp文档](https://sharp.pixelplumbing.com/api-output#png)

> 配置参数中的quality优先于Options.quality

#### Options.jpg: sharp.JpgOptions

jpg压缩配置，参考[sharp文档](https://sharp.pixelplumbing.com/api-output#jpeg)

> 配置参数中的quality优先于Options.quality
