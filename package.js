Package.describe({
  name: 'sanjo:karma',
  summary: 'Integrates Karma into Meteor',
  version: '0.12.24_2',
  git: 'https://github.com/Sanjo/meteor-karma.git'
})

Npm.depends({
  'karma': '0.12.24'
})

Package.onUse(function (api) {
  api.versionsFrom('1.0')
  api.use('underscore')
  api.addFiles('main.js', 'server')
  api.export('Karma')
  api.export('KarmaInternals')
})

Package.onTest(function(api){
  api.use('spacejamio:munit')
  api.use('sanjo:karma')
  api.addFiles(['specs/karma.js'], 'server')
})
