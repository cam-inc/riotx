# Riotx

ロードすると、[riotx](https://github.com/cam-inc/riotx)は、グローバルにシングルトンで存在します。

## 依存

```mermaid
graph LR
  riotx-- deps -->riot
```

Riotxは、
[riot](https://github.com/riot/riot) の、`mixin`, `observable` に依存しています。

## 設定

Riotxには設定があります。

### デバッグ

`console.log` に、デバッグログが出力されます。

`default : false`

```js
riotx.debug(true);
```

### [riot](https://github.com/riot/riot) カスタムタグ バインド名

[riot](https://github.com/riot/riot)のカスタムタグに、変更監視関数をバインディングする名前です。

`default : riotxChange`

```js
riotx.changeBindName('change');
```

**e.g.**

```html
<hello>
  <h1>Hello</h1>
  <script>
    this.change('trigger', (state, store) => {
      // ...
    });
  </script>
```

### 厳格モード

直接[ステート](STATE.md)を取得、設定できなくします。

`default : false`

> [プラグイン](PLUGINS.md) での直接変更は可能です。
