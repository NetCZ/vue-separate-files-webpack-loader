var assert = require('chai').assert;

var wrongPluginOrderError = '[VueSeparateFilesWebpackLoaderPlugin] Please use VueSeparateFilesWebpackLoaderPlugin after VueLoaderPlugin.',
  noCompatibleLoaderDefinitionFoundError = '[VueSeparateFilesWebpackLoaderPlugin] No matching rule for .vue. files found.\nMake sure there is at least one root-level rule that matches .vue. files.\nAlso make sure you pass options.test property when not using default one.';

var defaultPluginConfigurationState = {
  options: {
    test: /\.vue\./
  },
  testString: '.vue.'
};
var defaultLoaderRuleDefinition = {
  test: /\.vue\./,
  use: [
    {
      loader: 'vue-loader'
    },
    {
      loader: 'vue-separate-files-webpack-loader'
    }
  ]
};

var VueSeparatePlugin,
  VueLoaderPlugin = function () {
  };

beforeEach(function () {
  VueSeparatePlugin = require('../plugin');
});

afterEach(function () {
  VueSeparatePlugin = undefined;
});

describe('plugin: errors', function () {
  it('should throw TypeError - plugin call without compiler', function () {
    var plugin = new VueSeparatePlugin();
    assert.throws(plugin.apply, TypeError, 'Cannot read property \'options\' of undefined');
  });

  it('should throw TypeError - plugin call without proper compiler definition', function () {
    var plugin = new VueSeparatePlugin();
    var compiler = {};

    assert.throws(function () {
      plugin.apply(compiler);
    }, TypeError, 'Cannot read property \'plugins\' of undefined');
  });

  it('should throw Error - plugin call without plugins in compiler definition', function () {
    var plugin = new VueSeparatePlugin();
    var compiler = {
      options: {}
    };

    assert.throws(function () {
      plugin.apply(compiler);
    }, Error, wrongPluginOrderError);
  });

  it('should throw Error - plugin call with wrong plugins order in compiler definition', function () {
    var plugin = new VueSeparatePlugin();
    var compiler = {
      options: {
        plugins: [plugin, new VueLoaderPlugin()]
      }
    };

    assert.throws(function () {
      plugin.apply(compiler);
    }, Error, wrongPluginOrderError);
  });

  it('should throw TypeError - plugin call without module in compiler definition', function () {
    var plugin = new VueSeparatePlugin();
    var compiler = {
      options: {
        plugins: [new VueLoaderPlugin(), plugin]
      }
    };

    assert.throws(function () {
      plugin.apply(compiler);
    }, TypeError, 'Cannot read property \'rules\' of undefined');
  });

  it('should throw TypeError - plugin call without module rules in compiler definition', function () {
    var plugin = new VueSeparatePlugin();
    var compiler = {
      options: {
        plugins: [new VueLoaderPlugin(), plugin],
        module: {}
      }
    };

    assert.throws(function () {
      plugin.apply(compiler);
    }, TypeError, 'Cannot read property \'-1\' of undefined');
  });

  it('should throw Error - plugin call with empty module rules in compiler definition', function () {
    var plugin = new VueSeparatePlugin();
    var compiler = {
      options: {
        plugins: [new VueLoaderPlugin(), plugin],
        module: {
          rules: []
        }
      }
    };

    assert.throws(function () {
      plugin.apply(compiler);
    }, Error, noCompatibleLoaderDefinitionFoundError);
  });

  it('should throw Error - plugin call with empty loaders in rule definition', function () {
    var plugin = new VueSeparatePlugin();
    var compiler = {
      options: {
        plugins: [new VueLoaderPlugin(), plugin],
        module: {
          rules: [
            {
              test: /\.vue\./,
              use: []
            }
          ]
        }
      }
    };

    assert.throws(function () {
      plugin.apply(compiler);
    }, Error, noCompatibleLoaderDefinitionFoundError);
  });

  it('should throw Error - plugin call with missing separate loader in rule definition', function () {
    var plugin = new VueSeparatePlugin();
    var compiler = {
      options: {
        plugins: [new VueLoaderPlugin(), plugin],
        module: {
          rules: [
            {
              test: /\.vue\./,
              use: [
                {
                  loader: 'vue-loader'
                }
              ]
            }
          ]
        }
      }
    };

    assert.throws(function () {
      plugin.apply(compiler);
    }, Error, noCompatibleLoaderDefinitionFoundError);
  });
});

describe('plugin: options errors', function () {
  it('should throw Error when options test property is not RegExp datatype', function () {
    assert.throws(function () {
      new VueSeparatePlugin({
        test: 'WRONG'
      });
    }, Error, '[VueSeparateFilesWebpackLoaderPlugin] Test condition has to be RegExp.');
  });
});

describe('plugin: options success', function () {
  it('should pass with no options provided', function () {
    var plugin = new VueSeparatePlugin();

    assert.deepEqual(Object.entries(plugin), Object.entries(defaultPluginConfigurationState));
  });

  it('should pass when null, undefined, empty Object or Array provided', function () {
    var pluginNullOptions = new VueSeparatePlugin(null);

    assert.deepEqual(Object.entries(pluginNullOptions), Object.entries(defaultPluginConfigurationState));

    var pluginUndefinedOptions = new VueSeparatePlugin(undefined);

    assert.deepEqual(Object.entries(pluginUndefinedOptions), Object.entries(defaultPluginConfigurationState));

    var pluginEmptyObjectOptions = new VueSeparatePlugin({});

    assert.deepEqual(Object.entries(pluginEmptyObjectOptions), Object.entries(defaultPluginConfigurationState));

    var pluginArrayOptions = new VueSeparatePlugin([]);

    assert.deepEqual(Object.entries(pluginArrayOptions), Object.entries(defaultPluginConfigurationState));
  });

  it('should pass with test property changed', function () {
    var plugin = new VueSeparatePlugin({
      test: /\.condition/
    });

    var expected = {
      options: {
        test: /\.condition/
      },
      testString: '.condition'
    };

    assert.deepEqual(Object.entries(plugin), Object.entries(expected));
  });

  it('should pass with test property passed as RegExp datatype', function () {
    var plugin = new VueSeparatePlugin({
      test: new RegExp('\\.condition$')
    });

    var expected = {
      options: {
        test: /\.condition$/
      },
      testString: '.condition$'
    };

    assert.deepEqual(Object.entries(plugin), Object.entries(expected));
  });
});

describe('plugin: success', function () {
  it('should apply loader rule with default plugin options', function () {
    var plugin = new VueSeparatePlugin();
    var compiler = {
      options: {
        plugins: [new VueLoaderPlugin(), plugin],
        module: {
          rules: [defaultLoaderRuleDefinition]
        }
      }
    };

    var expected = {
      resource: {
        test: /\.vue\./
      },
      resourceQuery: undefined
    };

    plugin.apply(compiler);

    var rule = compiler.options.module.rules[0];
    delete rule.test;

    assert.deepEqual(rule.resource, expected.resource);
    assert.equal(rule.resourceQuery, expected.resourceQuery);
    assert.isFunction(rule.use);
    assert.deepEqual(rule.use({ resourceQuery: undefined }), defaultLoaderRuleDefinition.use)
  });

  it('should apply loader rule with custom plugin options', function () {
    var plugin = new VueSeparatePlugin({
      test: /\.condition/
    });
    var compiler = {
      options: {
        plugins: [new VueLoaderPlugin(), plugin],
        module: {
          rules: [
            {
              test: /\.condition/,
              use: [].concat(defaultLoaderRuleDefinition.use)
            }
          ]
        }
      }
    };

    var expected = {
      resource: {
        test: /\.condition/
      },
      resourceQuery: undefined
    };

    plugin.apply(compiler);

    var rule = compiler.options.module.rules[0];
    delete rule.test;

    assert.deepEqual(rule.resource, expected.resource);
    assert.equal(rule.resourceQuery, expected.resourceQuery);
    assert.isFunction(rule.use);
    assert.deepEqual(rule.use({ resourceQuery: undefined }), defaultLoaderRuleDefinition.use)
  });

  it('should contain exactly one rule for loader', function () {
    var plugin = new VueSeparatePlugin({
      test: /\.vue\./
    });
    var compiler = {
      options: {
        plugins: [new VueLoaderPlugin(), plugin],
        module: {
          rules: [defaultLoaderRuleDefinition, defaultLoaderRuleDefinition]
        }
      }
    };

    var expected = {
      resource: {
        test: /\.vue\./
      },
      resourceQuery: undefined
    };

    plugin.apply(compiler);

    var rule = compiler.options.module.rules[0];
    delete rule.test;

    assert.equal(compiler.options.module.rules.length, 1);
    assert.deepEqual(rule.resource, expected.resource);
    assert.equal(rule.resourceQuery, expected.resourceQuery);
    assert.isFunction(rule.use);
    assert.deepEqual(rule.use({ resourceQuery: undefined }), defaultLoaderRuleDefinition.use)
  });
});
