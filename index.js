var loaderUtils = require('loader-utils'),
  path = require('path'),
  _ = require('lodash'),
  helper = require('./src/helper');

var defaultOptions = {
  test: /\.vue\./,
  types: {
    template: '\\.html$|\\.pug$|\\.jade$',
    script: '\\.jsx?$|\\.coffee$|\\.tsx?$',
    style: '\\.css$|\\.s(a|c)ss$|\\.styl$|\\.less$'
  }
};

module.exports = function () {
  var options = helper.resolveOptions(loaderUtils.getOptions(this), _.cloneDeep(defaultOptions)),
    dirPath = this.context,
    fileNames = this.fs.readdirSync(dirPath).filter(function(file) { return !file.match(/^\./); });

  if (fileNames.length === 0) {
    return;
  }

  var parts = {},
    fileName = '';

  _.forEach(fileNames, function (file) {
    if (!file.match(options.test)) {
      return;
    }

    var fileNameParts = file.split(options.test);

    fileName = fileNameParts[0];

    var scoped = fileNameParts[1].includes('scoped.'),
      fileType = _.last(fileNameParts[1].split('.')),
      tagName = _.findKey(options.types, function (regex) {
        return file.match(regex);
      });

    if (_.has(parts, tagName)) {
      throw new TypeError('File "' + file + '" can\'t be used as "' + tagName +
        '", because it was already defined in "' + _.get(parts, tagName + '.file', null) + '".');
    }

    parts[tagName || fileType] = {
      name: tagName || fileType,
      file: file,
      attributes: _.assign({}, {
        src: path.join(dirPath, file),
        scoped: tagName === 'style' && scoped,
        lang: tagName ? fileType : false
      }, options.global, options[fileType] || {}, options[tagName] || {})
    };
  });

  return helper.createTags(parts).join('');
};
