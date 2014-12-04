# Karma Runner integration for Meteor

See [http://karma-runner.github.io/0.12/index.html] for more info on Karma Runner.

## API

`Karma.start(id, options)`: Starts a long running Karma server that will close when the Meteor App is closed.

For possible options see [http://karma-runner.github.io/0.12/config/configuration-file.html].

## Example

```javascript
var options = { ... }
Karma.start('my-karmer-server', options)
```

## License

MIT

The `lib/ChildProcessFactory.coffee` file has been originally written
by [Ronen Babayoff](https://github.com/rbabayoff) and is also under MIT license.
