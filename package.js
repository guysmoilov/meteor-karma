/* jshint camelcase: false */
/* global
   Package: false
 */

Package.describe({
  name: 'sanjo:karma',
  summary: 'Integrates Karma into Meteor',
  version: '0.1.0'
});

var fs = Npm.require('fs');
var config = getFileConfig()
if (!config.browsers) {
  config.browsers = ['Chrome']
}

var dependencies = {
  'karma': '0.12.24',
  "karma-angular-templating-html2js-preprocessor": "https://github.com/Sanjo/karma-angular-templating-html2js-preprocessor/archive/b1d6c26d46e4d8dad50432692cdb9714e9ae17a2.tar.gz"
};

var frameworkPlugins = {
  'jasmine': {
    name: 'karma-jasmine',
    version: '0.2.2'
  }
}

var browserPlugins = {
  'Chrome': {
    name: 'karma-chrome-launcher',
    version: '0.1.5'
  },
  'Firefox': {
    name: 'karma-firefox-launcher',
    version: '0.1.3'
  }
};

if (config.frameworks) {
  config.frameworks.forEach(function (framework) {
    var frameworkPlugin = frameworkPlugins[framework];
    if (frameworkPlugin) {
      dependencies[frameworkPlugin.name] = frameworkPlugin.version;
    } else {
      console.error('No plugin exists for framework "' + framework + '"');
    }
  });
} else {
  console.error('No frameworks are defined for Karma')
}

config.browsers.forEach(function (browser) {
  var browserPlugin = browserPlugins[browser];
  if (browserPlugin) {
    dependencies[browserPlugin.name] = browserPlugin.version;
  } else {
    console.error('No plugin exists for browser "' + browser + '"');
  }
});

Npm.depends(dependencies);

Package.onUse(function (api) {
  api.versionsFrom('METEOR@0.9.1')
  api.use('underscore')
  api.use('spacejamio:loglevel@1.1.0_1')
  api.addFiles(['server/main.js'], 'server')
  api.export('Karma')
});

function getFileConfig() {
  try {
    var configPath = process.env.PWD + '/karma.json'
    var configContent = fs.readFileSync(configPath, {encoding: 'utf8'})
    return JSON.parse(configContent)
  } catch (error) {
    return {}
  }
}
