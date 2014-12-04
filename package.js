Package.describe({
  name: 'sanjo:karma',
  summary: 'Integrates Karma into Meteor',
  version: '1.0.0',
  git: 'https://github.com/Sanjo/meteor-karma.git'
})

Npm.depends({
  'karma': '0.12.24',
  'karma-chrome-launcher': '0.1.5',
  'karma-jasmine': '0.2.3',
  'karma-coffee-preprocessor': '0.2.1',
  'karma-phantomjs-launcher-nonet': '0.1.3',
  'temp': '0.8.1'
})

Package.onUse(function (api) {
  api.versionsFrom('1.0')
  api.use('coffeescript', 'server')
  api.use('underscore', 'server')
  api.use('check', 'server')
  api.use('practicalmeteor:loglevel@1.1.0_2', 'server')

  api.addFiles([
    'lib/meteor/files.js',
    'lib/ChildProcessFactory.coffee',
    'main.js'
  ], 'server')

  api.export('Karma')
  api.export('KarmaInternals')
})

Package.onTest(function(api){
  api.use('spacejamio:munit')
  api.use('sanjo:karma')
  api.addFiles(['specs/karma.js'], 'server')
})
