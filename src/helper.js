var _ = require('lodash'),
  tag = require('create-html-element'),
  path = require('path');

var exports = {};

exports.addTag = function addTag(tags, tagName, attributes) {
  tags.push(tag({
    name: tagName,
    value: '',
    attributes: attributes
  }));
};

exports.createTags = function createTags(parts) {
  var template = _.get(parts, 'template', null),
    script = _.get(parts, 'script', null),
    style = _.get(parts, 'style', null),
    other = _.filter(parts, function (item, key) {
      return _.indexOf(['template', 'script', 'style'], key) === -1;
    }),
    tags = [],
    that = this;

  _.forEach(other, function (part) {
    that.addTag(tags, part.name, part.attributes);
  });

  if (template) {
    this.addTag(tags, 'template', template.attributes);
  }

  if (script) {
    this.addTag(tags, 'script', script.attributes);
  }

  if (style) {
    this.addTag(tags, 'style', style.attributes);
  }

  return tags;
};

exports.resolveFileTypes = function resolveFileTypes(options, type, types) {
  var fileTypes = _.get(options, 'types.' + type);

  if (!fileTypes) {
    throw new TypeError(_.upperFirst(type) + ' files check option must be string');
  }

  options.types[type] = new RegExp(types[type] + '|' + fileTypes);
};

exports.resolveOptions = function resolveOptions(options, defaultOptions) {
  options = _.assign({}, defaultOptions, options || {});

  this.resolveFileTypes(options, 'template', defaultOptions.types);
  this.resolveFileTypes(options, 'script', defaultOptions.types);
  this.resolveFileTypes(options, 'style', defaultOptions.types);

  return options;
};

exports.createPart = function createPart(settings, options) {
  return {
    name: settings.tagName || settings.fileType,
    file: settings.file,
    fileName: settings.fileName,
    attributes: _.assign({}, {
      src: path.join(settings.dirPath, settings.file),
      scoped: settings.tagName === 'style' && settings.scoped,
      lang: settings.tagName ? settings.fileType : false
    }, options.global, options[settings.fileType] || {}, options[settings.tagName] || {})
  };
};

exports.createParts = function createParts(options, dirPath, inputFile, fileNames) {
  var inputFileName = inputFile.split(options.test)[0];
  var parts = {},
    that = this;
  
  inputFileName = path.basename(inputFileName);

  _.forEach(fileNames, function (file) {
    if (!file.match(options.test) || !file.match(inputFileName)) {
      return;
    }

    var settings = that.parseFile(options, dirPath, file);

    if (_.has(parts, settings.tagName) || _.has(parts, settings.fileType)) {
      throw new TypeError('File "' + file + '" can\'t be used as "' + (settings.tagName || settings.fileType) +
        '", because it was already defined in "' + _.get(parts[settings.tagName || settings.fileType], 'file', null) + '".');
    }

    parts[settings.tagName || settings.fileType] = that.createPart(settings, options);
  });

  return parts;
};

exports.parseFile = function parseFile(options, dirPath, file) {
  var fileNameParts = file.split(options.test);
  var fileType = _.last(fileNameParts[1].split('.')),
    scoped = fileNameParts[1].includes('scoped.'),
    tagName = _.findKey(options.types, function (regex) {
      return file.match(regex);
    });

  return {
    tagName: tagName,
    fileType: fileType,
    file: file,
    dirPath: dirPath,
    scoped: scoped
  };
};

module.exports = exports;
