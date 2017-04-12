<spec>
  <h1>{ opts.message }</h1>
  <h2>Name: { name }</h2>
  <input ref="name" type="text" value="{ name }" onKeyUp="{evName}" autofocus>
  <script>
    this.name = '';
    var store = this.riotx.get("spec");
    var self = this;
    store.on("name", function (err, state, store) {
      if (err) { throw err; }
      var res = store.getters.name(state);
      self.name = res;
      self.update();
    });

    this.evName = function () { // emit action
      store.action("name", this.refs.name.value);
    };

  </script>
</spec>
