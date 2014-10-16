# Karma Runner integration for Meteor

See [http://karma-runner.github.io/0.12/index.html] for more info on Karma Runner.

## API

* Karma.server.start(options, callback)
* Karma.runner.run(options, callback)

For possible options see [http://karma-runner.github.io/0.12/config/configuration-file.html].

## Example

```javascript
var options = { ... }
Karma.server.start(options)
Meteor.setTimeout(function () {
  Karma.runner.run(options);
}, 10000);
```

## Config file

You can add a karma.json file to your app root directory and specify Karma options.
You must include the frameworks option in this file.
