var loaderUtils = require('loader-utils'),
  _ = require('lodash'),
  path = require('path'),
  fs = require('fs'),
  helper = require('./src/helper');

var defaultOptions = {
  test: /\.vue\./,
  types: {
    template: '\\.html$|\\.pug$|\\.jade$',
    script: '\\.jsx?$|\\.coffee$|\\.tsx?$',
    style: '\\.css$|\\.s(a|c)ss$|\\.styl$|\\.less$'
  }
};

module.exports = function (content, map) {
  map = map || {};

  var loaderOptions = loaderUtils.getOptions(this);
  var inputFile = map.file || path.basename(this.resourcePath),
    options = _.assign({}, _.cloneDeep(defaultOptions), loaderOptions),
    dirPath = this.context,
    fileNames = fs.readdirSync(dirPath).filter(function (file) {
      return !file.match(/^\./);
    });

  _.forEach(defaultOptions.types, function (definition, type) {
    var defaultDefinition = definition.split(/\|(?=\\)/g);
    var loaderDefinition = _.get(loaderOptions, 'types[' + type + ']', '').split(/\|(?=\\)/g);
    options.types[type] = _.compact(defaultDefinition.concat(loaderDefinition)).join('|');
  });

  if (fileNames.length === 0) {
    return;
  }

  var parts = helper.createParts(options, dirPath, inputFile, fileNames);

  return helper.createTags(parts).join('');
};
