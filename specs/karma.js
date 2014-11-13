describe('Karma Package', function () {
  describe('Karma', function () {
    describe('plugins', function () {
      describe('register', function () {
        it('registers a Karma plugin', function () {
          var pluginName = 'karma-chrome-launcher'
          var plugin = {}
          Karma.plugins.register(pluginName, plugin)
          expect(KarmaInternals.karmaPlugins[pluginName]).to.equal(plugin)
        });

        afterEach(function () {
          KarmaInternals.emptyPlugins()
        })
      });
    });
  });

  describe('KarmaInternals', function () {
    describe('karmaPlugins', function () {
      it('is initially an empty object', function () {
        expect(KarmaInternals.karmaPlugins).to.eql({})
      });
    });

    describe('emptyPlugins', function () {
      it('removes all registered plugins', function () {
        var pluginName = 'karma-chrome-launcher'
        var plugin = {}
        Karma.plugins.register(pluginName, plugin)

        KarmaInternals.emptyPlugins()

        expect(KarmaInternals.karmaPlugins).to.eql({})
      });
    });

    describe('loadPlugins', function () {
      it('replaces the plugin names with the plugin instances', function () {
        var pluginName = 'karma-chrome-launcher'
        var plugin = {}
        Karma.plugins.register(pluginName, plugin)

        var options = {
          plugins: [pluginName]
        }

        var optionsWithLoadedPlugins = KarmaInternals.loadPlugins(options)

        expect(optionsWithLoadedPlugins.plugins[0]).to.equal(plugin)
      });

      it('throws when a plugin is not available', function () {
        var pluginName = 'karma-chrome-launcher'
        var options = {
          plugins: [pluginName]
        }

        var loadPlugins = function () {
          KarmaInternals.loadPlugins(options)
        }

        expect(loadPlugins).to.throw(Error)
      });

      afterEach(function () {
        KarmaInternals.emptyPlugins()
      })
    });
  });
});
