[日本語 Japanese](README.ja.md)

# riotx

Centralized State Management for riot.js

![riotx](art/riotx.png)

# Install

```
$ npm install --save riotx
```

# Example

# index.html

```javascript 1.8
<hello>
  <h2>Name: { name }</h2>
  <input ref="name" type="text" value="{ name }" onKeyUp="{evName}" autofocus>
  <script>
    this.name = '';
    var store = this.riotx.get();
    var self = this;

    store.change("name", function (state, store) {
      var res = store.getter('name');
      self.name = res;
      self.update();
    });

    this.evName = function () { // emit action
      store.action("name", this.refs.name.value);
    };

  </script>
</hello>
```

## index.js

```javascript 1.8
let store = new riotx.Store({
  state: {
    name: "",
  },
  actions: {
    name: (context, name) => {
      return Promise
        .resolve()
        .then(() => {
          context.commit('name', {name});
        });
    }
  },
  mutations: {
    name: (context, obj) => {
      context.state.name = obj.name;
      return ['name'];
    }
  },
  getters: {
    name: context => {
      return context.state.name;
    }
  }
});

riotx.add(store);

```

> More example to `./test`


# Descriptions

## Riot(View) Components

Custom tag of `riot.js`.

> Inside a component, you can access `riotx` through `this.riotx`.


## Actions

Logics and asynchronous processing like calling API should be implemented in Actions.

Actions are entrypoints for riotx.


## Mutations

`Mutations` mutate data in `State`.

`mutations` are the only way to update `State`.

You may need to trigger `change event` at the end of mutation.

## State

Manages data.

It is allowed to access `State` but you should always update `State` through `Mutations`.

> Using `getter` you can get filtered data.


## Getters

You can get filtered data of `State`.

It is not allowed to mutate `State` through `Getters`.


# API

## RiotX

### version: string

returns Version number.

### add(store): Riotx

register a store.

registering multiple stores is allowed.

@see `Store.name`

### get(name='@'): Store

returns a store.

### debug(flag): Riotx

returns the state of debugging mode. active or not.

### reset(): Riotx

reset data.

### size(): int

returns the total number of stores.

# Store

### constructor(setting): Riotx

a store setting.

```
setting
{
  name: string key(default='@', optional)
  actions: object key=string, value=function
  mutations: object key=string, value=function
  getters: object key=string, value=function
}
```

### action(name, parameter...): Promise

executes an action.

### getter(name, parameter...): ...

executes a getter.

### change(name, parameter...): null

starts listening to change events.



# Develop

## Pre

```
$ npm install .
```

## Launch Develop/Debug Environment.

```
$ npm run karma-dev
```

# npm target

## Test (karma/mocha)

```
$ npm run test
```

> `Chrome` on Machine. custom to `test/karma/karma.conf.js`

## Test (require.js)

[Read more](test/requirejs)

## Test (browserify)

[Read more](test/browserify)

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
