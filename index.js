var tag = require('create-html-element'),
  loaderUtils = require('loader-utils'),
  path = require('path'),
  _ = require('lodash');

var regexes = {
  script: /\.jsx?$|\.coffee$|\.tsx?$/,
  style: /\.css$|\.s(a|c)ss$|\.styl$|\.less$/,
  template: /\.html$|\.pug$|\.jade$/
};

module.exports = function () {
  var options = loaderUtils.getOptions(this) || {},
    dirPath = this.context,
    fileNames = this.fs.readdirSync(dirPath);

  if (fileNames.length === 0) {
    return;
  }

  var tags = [],
    tagTypesUsed = {},
    fileName = '';

  fileNames.forEach(function (file) {
    if (!file.match(/\.vue\./)) {
      return;
    }

    var fileNameParts = file.split(/\.vue\./);

    fileName = fileNameParts[0];

    var scoped = fileNameParts[1].includes('scoped.'),
      fileType = _.last(fileNameParts[1].split('.')),
      tagName = _.findKey(regexes, function (regex) {
        return file.match(regex);
      });

    if (_.has(tagTypesUsed, tagName)) {
      throw new Error('File "' + file + '" can\'t be used as "' + tagName +
        '", because it was already defined in "' + _.get(tagTypesUsed, tagName) + '".');
    }

    tags.push(tag({
      name: tagName || fileType,
      value: '',
      attributes: _.assign({}, {
        src: path.join(dirPath, file),
        scoped: tagName === 'style' && scoped,
        lang: tagName ? fileType : false
      }, options.global, options[fileType] || {}, options[tagName] || {})
    }));

    tagTypesUsed[tagName] = file;
  });

  return tags.join('');
};
