# テスト

すべてのテストが、どのスコープからでも可能です。


```mermaid
graph LR
  subgraph Riotx
    subgraph Store
      Actions((Actions)) -- Commit --> Mutations
      Mutations((Mutations))-- Mutates-->State
      Getters((Getters))-- Filter -->State
      Plugins((Plugins))-- Mutations after hook -->Mutations
    end
  end
  subgraph Testing
    BroserNodeJS("Browser/NodeJS") -. mocha .->Actions
    BroserNodeJS("Browser/NodeJS") -. mocha .->Mutations
    BroserNodeJS("Browser/NodeJS") -. mocha .->State
    BroserNodeJS("Browser/NodeJS") -. mocha .->Getters
  end
```

## サンプル

Riotxのテストコードが参考になります。

[テストコード](https://github.com/cam-inc/riotx/tree/develop/test)

## おすすめのテストツール

Riotx 開発チームは、[Karma](https://github.com/karma-runner/karma), [Mocha](https://github.com/mochajs/mocha), [Chai](https://github.com/chaijs/chai), [power-assert](https://github.com/power-assert-js/power-assert) を使ってテストを行っています。
