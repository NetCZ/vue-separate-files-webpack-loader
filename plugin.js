var _ = require('lodash');

var defaultOptions = {
  test: /\.vue\./
};

function VueSeparateFilesWebpackLoaderPlugin(options) {
  this.options = _.assign({}, _.cloneDeep(defaultOptions), options);

  if (!_.isRegExp(this.options.test)) {
    throw new Error('[VueSeparateFilesWebpackLoaderPlugin] Test condition has to be RegExp.');
  }

  this.testString = this.options.test.source.replace(/\\\./g, '.');
}

function matcher(item) {
  return _.findIndex(item.use, function (use) {
    return use.loader === 'vue-separate-files-webpack-loader';
  }) !== -1;
}

VueSeparateFilesWebpackLoaderPlugin.prototype.apply = function (compiler) {
  var plugins = _.filter(compiler.options.plugins, function (plugin) {
    var name = plugin.constructor.name;
    return name === 'VueLoaderPlugin' || name === 'VueSeparateFilesWebpackLoaderPlugin';
  });
  var vueLoaderPluginIndex = _.findIndex(plugins, function (plugin) {
    return plugin.constructor.name === 'VueLoaderPlugin';
  });

  // make sure VueSeparateFilesWebpackLoaderPlugin is used after VueLoaderPlugin
  if (vueLoaderPluginIndex !== 0) {
    throw new Error('[VueSeparateFilesWebpackLoaderPlugin] Please use VueSeparateFilesWebpackLoaderPlugin after VueLoaderPlugin.');
  }

  var rules = compiler.options.module.rules;
  var ruleIndex = _.findIndex(rules, matcher);
  var rule = rules[ruleIndex];

  if (!rule) {
    throw new Error('[VueSeparateFilesWebpackLoaderPlugin] No matching rule for ' + this.testString + ' files found.\n' +
      'Make sure there is at least one root-level rule that matches ' + this.testString + ' files.\n' +
      'Also make sure you pass options.test property when not using default one.'
    );
  }

  var ruleUse = _.concat([], rule.use);

  rule = _.assign({}, rule, {
    resource: {
      test: this.options.test
    },
    resourceQuery: undefined,
    use: function (options) {
      return /separated/.test(options.resourceQuery) ? [] : ruleUse;
    }
  });

  // remove all vue separate files webpack loader rules so when duplicated is not called multiple times
  compiler.options.module.rules = _.reject(compiler.options.module.rules, matcher);

  compiler.options.module.rules.push(rule);
};

module.exports = VueSeparateFilesWebpackLoaderPlugin;
