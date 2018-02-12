var _ = require('lodash'),
  tag = require('create-html-element');

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

module.exports = exports;
