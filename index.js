var loaderUtils = require('loader-utils'),
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

module.exports = function (content, map) {
  var inputFile = map.file,
    options = helper.resolveOptions(loaderUtils.getOptions(this), _.cloneDeep(defaultOptions)),
    dirPath = this.context,
    fileNames = this.fs.readdirSync(dirPath).filter(function (file) {
      return !file.match(/^\./);
    });

  if (fileNames.length === 0) {
    return;
  }

  var parts = helper.createParts(options, dirPath, inputFile, fileNames);

  return helper.createTags(parts).join('');
};
