# API リファレンス

## riotx.Store

``` js
import riotx from 'riotx'

const store = new riotx.Store({ ...options })
```

### riotx.Store constructor

- **state**
  - Type: `Object`
    ステートオブジェクト
    [詳細](STATE.md)

- **mutations**

  - Type: `{ [String: name]: Function (context, data) return Array[String] }`
  - Description: [ストア](STORES.md)に[ミューテーション](MUTATIONS.md)を登録
  - [詳細](MUTATIONS.md)

  - Arguments
    - `context`
      - Type: `Object`
      - Description: Riotxが提供するコンテキスト情報
      - `context.state`
        - Type: `Object`
        - Description: [ステート](STATE.md)情報
      - `context.getter`
        - Type: `Function`
        - Description: `store.getter` ショートカット
        `getter`関数をつかって、[ミューテーション](MUTATIONS.md)で必要なデータを取得することができる
    - `data`
      - Type: `Object`
      - Description: [ミューテーション](MUTATIONS.md)に渡したいデータ
  - Return
    - Type: `Array`
    - Description: [ステート](STATE.md)の変更を通知するトリガー名を配列で返却
    トリガーはコミット完了後に自動で発火

- **actions**

  - Type: `{ [String: name]: Function (Object: context, Object: data) return Promise }`
  - Description: [ストア](STORES.md)に[アクション](ACTIONS.md)を登録
  - [詳細](ACTIONS.md)
  - Arguments
    - `context`
      - Type: `Object`
      - Description: Riotxが提供するコンテキスト情報
      - `context.commit`
        - Type: `Function`
        - Description: [ミューテーション](MUTATIONS.md)に依頼
      - `context.getter`
        - Type: `Function`
        - Description: `store.getter` ショートカット
        `getter`関数をつかって、[アクション](ACTIONS.md)で必要なデータを取得することができる
    - `data`
      - Type: `Object`
      - Description: [アクション](ACTIONS.md)に渡したいデータ
  - Return
    - Type: `Promise`
    - Description: 連続してのアクション操作や例外処理に使える

- **getters**

  - Type: `{ [String: name]: Function (Object: context, Object: data) return * }`
  - Description: ストアにゲッターを登録
  - [詳細](GETTERS.md)
  - Arguments
    - `context`
      - Type: `Object`
      - Description: Riotxが提供するコンテキスト情報
      - `context.state`
        - Type: `Object`
        - Description: [ステート](STATE.md)情報
      - `context.getter`
        - Type: `Function`
        - Description: `store.getter` ショートカット
        `getter`関数をつかって、[ゲッター](GETTERS.md)で必要なデータを取得
    - `data`
      - Type: `Object`
      - Description: [ゲッター](GETTERS.md)に渡したいデータ
  - Return
    - Type: `*`
    - Description: フィルターした結果を返却

- **plugins**

  - Type: `Array[Function (riotx.Store: store)]`
  - Description: [プラグイン](PLUGINS.md)関数の配列は、[ストア](STORES.md)生成時に適用
  - [詳細](PLUGINS.md)
  - Arguments
    - `store`
    - Type: `riotx.Store`
    - Description: [ストア](STORES.md)情報

### riotx.Store properties

- **name** [詳細](STORES.md)

  - Type: `String`
  - Default: `@`
  - Description: [ストア](STORE.md)名 を指定
  複数の[ステート](STATE.md)を１つの[ストア](STORES.md)で管理する場合に使用

- **state** [詳細](STATE.md)
  - Type: `Object`
  - Description: [ステート](STATE.md)情報
  [厳格モード](RIOTX.md)を使用すると、操作することができなる。

### riotx.Store methods

- **reset**
  - Type: `Function`
  - Description: [ストア](STORES.md)をリセット
  内部の参照をすべて切断したりなど、メモリ解放の手助けを行う
  [厳格モード](RIOTX.md)を使用すると、操作することができなくなります。

- **getter** [詳細](GETTERS.md)
  - Type: `Function (String: name, Object: data) return *`
  - Description: getterを呼び出します。

  - Arguments
    - `name`
      - Type: `String`
      - Description: [ゲッター](GETTERS.md)名
    - `data`
      - Type: `Object`
      - Description: [ゲッター](GETTERS.md)に渡したいデータ

- **commit** [詳細](ACTIONS.md)
  - Type: `Function (String: name, Object: data) return Array[String]`
  - Description: [ミューテーション](MUTATIONS.md)を呼び出す
  - **重要** [アクション](ACTIONS.md)経由での操作が望ましいです。

  - Arguments
    - `name`
      - Type: `String`
      - Description: [ミューテーション](MUTATIONS.md)名
    - `data`
      - Type: `Object`
      - Description: [ミューテーション](MUTATIONS.md)に渡したいデータ

- **action** [詳細](ACTIONS.md)
  - Type: `Function (String: name, Object: data) return Promise`
  - Description: [アクション](ACTIONS.md)を呼び出す

  - Arguments
    - `name`
      - Type: `String`
      - Description: [アクション](MUTATIONS.md)名
    - `data`
      - Type: `Object`
      - Description: [アクション](MUTATIONS.md)に渡したいデータ

- **change** [詳細](STATE.md)
  - Type: `String: name, Function (state, store)`
  - Description: [ステート](STATE.md)の変更監視を行う

  - Arguments
    - `name`
      - Type: `String`
      - Description: トリガー名 [ステート](STATE.md) - 変更を監視して取得 を参照
    - `Function`
      - Type: `Function`
      - Description: 指定したトリガーが発火した際に呼ばれる
      - `state`
        - Type: `Object`
        - Description: [ステート](STATE.md)情報
      - `store`
        - Type: `riotx.Store`
        - Description: riotx.Store 情報

## riotx

``` js
import riotx from 'riotx'
```

### riotx properties

- **version**

  - Type: `String`
  - Description: Riotxのバージョン情報

- **Store**

  - Type: `Class`
  - Description: riotx.Store クラス

- **stores**

  - Type: `{ [String: name]: riotx.Store }`
  - Description: riotxが管理している [ストア](STORES.md) データ

### riotx methods

- **setChangeBindName** [詳細](RIOTX.md)

  - Type: `Function (String: name)`
  - Default: `riotxChange`
  - Description: riotカスタムタグでの、[ステート](STATE.md)の変更監視の関数名を設定
  - TIPS: riotカスタムタグで、`this.change` を拡張していない場合は、`change`に変更するとriotx.Store.changeと同じになり実装が楽になります。

- **add**

  - Type: `Function (riotx.Store: store)`
  - Description: [ストア](STORES.md) 登録
  [プラグイン](PLUGINS.md) のロードは、このタイミングで行われます。

- **get**

  - Type: `Function (String: name) return riotx.Store`
  - Description: [ストア](STORES.md) 取得

  - Arguments
  - `name`
    - Type: `String`
    - Default: `@`
    - Description: [ストア](STORES.md) 名

- **debug**

  - Type: `Boolean`
  - Default: `false`
  - Description: `riotx` のデバッグログをコンソールに出力

- **strict** [詳細](RIOTX.md) `Experimental`

  - Type: `Boolean`
  - Default: `false`
  - Description: 厳格モードで動作

- **reset**

  - Type: `Function`
  - Description: `riotx.stores`で管理しているすべての[ストア](STORES.md)をリセット

- **size**

  - Type: `int`
  - Description: `riotx.stores`で管理しているすべての[ストア](STORES.md)の件数を取得
