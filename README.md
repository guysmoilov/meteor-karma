# Karma Runner integration for Meteor

See [http://karma-runner.github.io/0.12/index.html] for more info on Karma Runner.

## API

* Karma.server.start(options, callback)
* Karma.runner.run(options, callback)
* Karma.plugins.register(pluginName, pluginObject)

For possible options see [http://karma-runner.github.io/0.12/config/configuration-file.html].

## Example

```javascript
var options = { ... }
Karma.server.start(options)
Meteor.setTimeout(function () {
  Karma.runner.run(options);
}, 10000);
```
