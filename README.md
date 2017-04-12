[日本語 Japanese](README.ja.md)

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
- [ ] reset riot.stores
- [ ] riot.stores.length

# Descriptions

## Actions

Write the logic.
It does not update State.

## Mutations

Update the State.

## State

Manage data.

## View Components

It is a custom tag of `riot.js`.

> From within the tag, you can access `riotx` with` this.riotx`.


## Getters

You can process and obtain the information of `State`.

`State` can not be rewritten.

# Develop

## Pre

```
$ npm install .
```

## Launch development / debugging environment

```
$ npm run karma-dev
```

# Target scripts.

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
