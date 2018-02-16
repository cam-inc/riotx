# インストール


## ダウンロード, CDN

[https://github.com/cam-inc/riotx/tree/develop/dist](https://github.com/cam-inc/riotx/tree/develop/dist) もしくは、下記の unpkg.com を利用してください。



> 重要 : unpkgは、無料のベストエフォートサービスです。稼働時間やサポートを保証していません。 [https://unpkg.com](https://unpkg.com)

- 非圧縮版
  - [https://unpkg.com/riotx/dist/riotx.js](https://unpkg.com/riotx/dist/riotx.js)
- 圧縮版
  - [https://unpkg.com/riotx/dist/riotx.min.js](https://unpkg.com/riotx/dist/riotx.min.js)
- バージョン指定
  - [https://unpkg.com/riotx@1.0.0/dist/riotx.js](https://unpkg.com/riotx@1.0.0/dist/riotx.js)


## NPM


**[Webpack](https://webpack.js.org/)**, **[Rollup](https://github.com/rollup/rollup)** はこちらを使用してください。

```
$ npm install --save riotx
```

> [https://www.npmjs.com/package/riotx](https://www.npmjs.com/package/riotx)

## Browserify

[Browserify](http://browserify.org/)

テストサンプルを見てください。シンプルな組み込みコードがあります。

[https://github.com/cam-inc/riotx/tree/develop/test/browserify](https://github.com/cam-inc/riotx/tree/develop/test/browserify)

## RequireJS

[RequireJS](http://requirejs.org/)

テストサンプルを見てください。シンプルな組み込みコードがあります。

[https://github.com/cam-inc/riotx/tree/develop/test/requirejs](https://github.com/cam-inc/riotx/tree/develop/test/requirejs)


## Bower

[Bower](https://bower.io/)


テストサンプルを見てください。シンプルな組み込みコードがあります。

[https://github.com/cam-inc/riotx/tree/develop/test/requirejs](https://github.com/cam-inc/riotx/tree/develop/test/requirejs)


## ソースからビルド

```
$ git clone https://github.com/cam-inc/riotx.git
$ npm install
$ npm run build

---

出力ファイル
dist/
├── amd.riotx+riot.js
├── amd.riotx+riot.min.js
├── amd.riotx.js
├── amd.riotx.min.js
├── riotx+riot.js
├── riotx+riot.min.js
├── riotx.js
└── riotx.min.js
lib/
└── index.js
index.js
```
