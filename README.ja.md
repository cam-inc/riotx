[English](README.md)

# riotx

Centralized State Management for riot.js

```
Store 

╔═════════╗       ╔═══════════╗       ╔═══════════╗       ╔═════════════════╗
║ Actions ║──────>║ Mutations ║ ────> ║   State   ║ ────> ║ View Components ║
╚═════════╝       ╚═══════════╝       ╚═══════════╝       ╚═════════════════╝
     ^                                      ^                  │    │
     │                                      │    ╔═════════╗   │    │
     │                                      └────║ Getters ║<──┘    │  
     │                                           ╚═════════╝        │
     │                                                              │
     └──────────────────────────────────────────────────────────────┘
```

# TODO

- [ ] import Promise library and Promise support 
- [ ] import Object.assign library

# Install

```
$ npm install --save riotx
```

# Descriptions

## Actions

API通信などの非同期処理、各種ロジックはActionに実装します。

すべての処理はActionを起点に始めてください。


## Mutations

Actionで、行った処理を元に、`State`を更新します。

`State`の更新は、mutation だけで行ってください。

## State

状態(データ)を管理します。

参照することは可能ですが、更新は `Mutations` からのみ行ってください。

## View Components

`riot.js` のカスタムタグです。

> `this.riotx` で `riotx` にアクセス可能です。


## Getters

`State` の情報を加工して取得することができます。

`State` の書き換えはできません。

# Develop

# Pre

```
$ npm install .
```

## Test (karma/mocha)

```
$ npm run test
```

> `Chrome` `Firefox` `Safari` on Machine.

## Test (require.js)

[Test - require.js](test/requirejs)

## Test (browserify)
 
[Test - browserify](test/browserify)

## Build and minify

```
$ npm run build 
```

## Watch

```
$ npm run watch
```

## ESLint

```
$ npm run lint
```

## Watch

```
$ npm run watch
```
