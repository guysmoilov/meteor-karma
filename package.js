Package.describe({
  name: 'sanjo:karma',
  summary: 'Integrates Karma into Meteor',
  version: '1.4.1',
  git: 'https://github.com/Sanjo/meteor-karma.git'
})

Npm.depends({
  'karma': '0.12.31',
  'karma-chrome-launcher': '0.1.7',
  'karma-firefox-launcher': '0.1.4',
  'karma-jasmine': '0.3.5',
  'karma-coffee-preprocessor': '0.2.1',
  'karma-phantomjs-launcher': '0.1.4',
  'karma-sauce-launcher': '0.2.10',
  'fs-extra': '0.12.0'
})

Package.onUse(function (api) {
  api.versionsFrom('1.0')
  api.use('coffeescript', 'server')
  api.use('underscore', 'server')
  api.use('check', 'server')
  api.use('practicalmeteor:loglevel@1.1.0_2', 'server')

  api.addFiles([
    'lib/meteor/files.js',
    'lib/LongRunningChildProcess.coffee',
    'main.js'
  ], 'server')

  api.addFiles(['lib/spawnScript.js'], 'server', {isAsset: true})

  api.export('Karma')
  api.export('KarmaInternals')
})

Package.onTest(function(api){
  api.use('spacejamio:munit')
  api.use('sanjo:karma')
  api.addFiles(['specs/karma.js'], 'server')
})
