var assert = require('assert'),
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash');

var loader,
  webpack,
  dir = path.resolve(__dirname);

var twoPartsDir = path.resolve(dir + '/files/two-parts/') + path.sep,
  threePartsDir = path.resolve(dir + '/files/three-parts/') + path.sep,
  customBlockDir = path.resolve(dir + '/files/custom-block/') + path.sep,
  duplicateDir = path.resolve(dir + '/files/duplicate/') + path.sep,
  emptyDir = path.resolve(dir + '/files/empty/') + path.sep;

beforeEach(function () {
  loader = require('../index');
  webpack = {
    fs: fs
  };
});

afterEach(function () {
  loader = undefined;
  webpack = undefined;
});

describe('generic errors', function () {
  it('should throw TypeError', function () {
    assert.throws(loader, TypeError);
  });

  it('should throw TypeError', function () {
    assert.throws(function () {
      loader.apply(webpack);
    }, TypeError);
  });

  it('should throw duplication TypeError', function () {
    assert.throws(function () {
      loader.apply(_.assign({}, webpack, { context: duplicateDir }));
    }, TypeError);
  });
});

describe('config', function () {
  it('should return empty response', function () {
    var result = loader.apply(_.assign({}, webpack, { context: twoPartsDir, query: { test: /\.v\./ } }));
    var expected = '';
    assert.strictEqual(result, expected);
  });

  it('should return void response', function () {
    var result = loader.apply(_.assign({}, webpack, { context: emptyDir, query: { test: /\.vue\./ } }));
    var expected = undefined;
    assert.strictEqual(result, expected);
  });
});

describe('success', function () {
  it('should has two parts', function () {
    var expected = '<template src="' + twoPartsDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + twoPartsDir + 'Component.vue.js" lang="js"></script>';
    var result = loader.apply(_.assign({}, webpack, { context: twoPartsDir }));
    assert.strictEqual(result, expected);
  });

  it('should has three parts', function () {
    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css"></style>';
    var result = loader.apply(_.assign({}, webpack, { context: threePartsDir }));
    assert.strictEqual(result, expected);
  });

  it('should has custom block', function () {
    var expected = '<docs src="' + customBlockDir + 'Component.vue.docs"></docs>' +
      '<template src="' + customBlockDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + customBlockDir + 'Component.vue.js" lang="js"></script>';
    var result = loader.apply(_.assign({}, webpack, { context: customBlockDir }));
    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on all tags', function () {
    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html" one="two"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js" one="two"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css" one="two"></style>';
    var result = loader.apply(_.assign({}, webpack, { context: threePartsDir, query: { global: { one: 'two' } } }));
    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on template tag', function () {
    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html" one="two"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css"></style>';
    var result = loader.apply(_.assign({}, webpack, { context: threePartsDir, query: { template: { one: 'two' } } }));
    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on script tag', function () {
    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js" one="two"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css"></style>';
    var result = loader.apply(_.assign({}, webpack, { context: threePartsDir, query: { script: { one: 'two' } } }));
    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on style tag', function () {
    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css" one="two"></style>';
    var result = loader.apply(_.assign({}, webpack, { context: threePartsDir, query: { style: { one: 'two' } } }));
    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on html tag', function () {
    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html" one="two"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css"></style>';
    var result = loader.apply(_.assign({}, webpack, { context: threePartsDir, query: { html: { one: 'two' } } }));
    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on js tag', function () {
    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js" one="two"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css"></style>';
    var result = loader.apply(_.assign({}, webpack, { context: threePartsDir, query: { js: { one: 'two' } } }));
    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on css tag', function () {
    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css" one="two"></style>';
    var result = loader.apply(_.assign({}, webpack, { context: threePartsDir, query: { css: { one: 'two' } } }));
    assert.strictEqual(result, expected);
  });
});
