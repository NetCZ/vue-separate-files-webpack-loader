var assert = require('assert'),
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash');

var loader,
  webpack,
  dir = path.resolve(__dirname);

var twoPartsDir = path.resolve(dir + '/files/two-parts') + path.sep,
  threePartsDir = path.resolve(dir + '/files/three-parts') + path.sep,
  customBlockDir = path.resolve(dir + '/files/custom-block') + path.sep,
  duplicateDir = path.resolve(dir + '/files/duplicate') + path.sep,
  emptyDir = path.resolve(dir + '/files/empty') + path.sep,
  twoComponentsSameDir = path.resolve(dir + '/files/two-components-same-dir') + path.sep,
  twoComponentsDuplicateSameDir = path.resolve(dir + '/files/two-components-duplicate-same-dir') + path.sep;

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

describe('errors', function () {
  it('should throw TypeError - simple loader call', function () {
    assert.throws(loader, TypeError);
  });

  it('should throw TypeError - loader call without context', function () {
    assert.throws(function () {
      loader.apply(webpack);
    }, TypeError);
  });

  it('should throw duplication TypeError', function () {
    var content = require(duplicateDir + 'Component.vue');

    assert.throws(function () {
      loader.apply(_.assign({}, webpack, { context: duplicateDir }), [content, { file: 'Component.vue.js' }]);
    }, TypeError);
  });

  it('should throw duplication TypeError - multiple components in same directory', function () {
    var content = require(duplicateDir + 'Component.vue');

    assert.throws(function () {
      loader.apply(_.assign({}, webpack, { context: twoComponentsDuplicateSameDir }), [content, { file: 'Component.vue.js' }]);
    }, TypeError);
  });
});

describe('config', function () {
  it('should return empty response', function () {
    var content = require(twoPartsDir + 'Component.vue');

    var result = loader.apply(_.assign({}, webpack, {
      context: twoPartsDir,
      query: { test: /\.v\./ }
    }), [content, { file: 'Component.vue.js' }]);

    var expected = '';

    assert.strictEqual(result, expected);
  });

  it('should return void response', function () {
    var content = require(twoPartsDir + 'Component.vue');

    var result = loader.apply(_.assign({}, webpack, {
      context: emptyDir,
      query: { test: /\.vue\./ }
    }), [content, { file: 'Component.vue.js' }]);

    var expected = undefined;

    assert.strictEqual(result, expected);
  });
});

describe('success', function () {
  it('should has two parts', function () {
    var content = require(twoPartsDir + 'Component.vue');

    var expected = '<template src="' + twoPartsDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + twoPartsDir + 'Component.vue.js" lang="js"></script>';

    var result = loader.apply(_.assign({}, webpack, { context: twoPartsDir }), [content, { file: 'Component.vue.js' }]);

    assert.strictEqual(result, expected);
  });

  it('should has three parts', function () {
    var content = require(threePartsDir + 'Component.vue');

    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css"></style>';

    var result = loader.apply(_.assign({}, webpack, { context: threePartsDir }), [content, { file: 'Component.vue.js' }]);

    assert.strictEqual(result, expected);
  });

  it('should has custom block', function () {
    var content = require(customBlockDir + 'Component.vue');

    var expected = '<docs src="' + customBlockDir + 'Component.vue.docs"></docs>' +
      '<template src="' + customBlockDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + customBlockDir + 'Component.vue.js" lang="js"></script>';

    var result = loader.apply(_.assign({}, webpack, { context: customBlockDir }), [content, { file: 'Component.vue.js' }]);

    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on all tags', function () {
    var content = require(threePartsDir + 'Component.vue');

    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html" one="two"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js" one="two"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css" one="two"></style>';

    var result = loader.apply(_.assign({}, webpack, {
      context: threePartsDir,
      query: { global: { one: 'two' } }
    }), [content, { file: 'Component.vue.js' }]);

    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on template tag', function () {
    var content = require(threePartsDir + 'Component.vue');

    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html" one="two"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css"></style>';

    var result = loader.apply(_.assign({}, webpack, {
      context: threePartsDir,
      query: { template: { one: 'two' } }
    }), [content, { file: 'Component.vue.js' }]);

    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on script tag', function () {
    var content = require(threePartsDir + 'Component.vue');

    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js" one="two"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css"></style>';

    var result = loader.apply(_.assign({}, webpack, {
      context: threePartsDir,
      query: { script: { one: 'two' } }
    }), [content, { file: 'Component.vue.js' }]);

    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on style tag', function () {
    var content = require(threePartsDir + 'Component.vue');

    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css" one="two"></style>';

    var result = loader.apply(_.assign({}, webpack, {
      context: threePartsDir,
      query: { style: { one: 'two' } }
    }), [content, { file: 'Component.vue.js' }]);

    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on html tag', function () {
    var content = require(threePartsDir + 'Component.vue');

    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html" one="two"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css"></style>';

    var result = loader.apply(_.assign({}, webpack, {
      context: threePartsDir,
      query: { html: { one: 'two' } }
    }), [content, { file: 'Component.vue.js' }]);

    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on js tag', function () {
    var content = require(threePartsDir + 'Component.vue');

    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js" one="two"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css"></style>';

    var result = loader.apply(_.assign({}, webpack, {
      context: threePartsDir,
      query: { js: { one: 'two' } }
    }), [content, { file: 'Component.vue.js' }]);

    assert.strictEqual(result, expected);
  });

  it('should has three parts with parameters on css tag', function () {
    var content = require(threePartsDir + 'Component.vue');

    var expected = '<template src="' + threePartsDir + 'Component.vue.html" lang="html"></template>' +
      '<script src="' + threePartsDir + 'Component.vue.js" lang="js"></script>' +
      '<style src="' + threePartsDir + 'Component.vue.css" lang="css" one="two"></style>';

    var result = loader.apply(_.assign({}, webpack, {
      context: threePartsDir,
      query: { css: { one: 'two' } }
    }), [content, { file: 'Component.vue.js' }]);

    assert.strictEqual(result, expected);
  });

  it('should parse two components in same dir', function () {
    var firstComponentContent = require(twoComponentsSameDir + 'FirstComponent.vue');
    var secondComponentContent = require(twoComponentsSameDir + 'SecondComponent.vue');

    var firstComponentExpected = '<template src="' + twoComponentsSameDir + 'FirstComponent.vue.html" lang="html"></template>' +
      '<script src="' + twoComponentsSameDir + 'FirstComponent.vue.js" lang="js"></script>';
    var firstComponentResult = loader.apply(_.assign({}, webpack, { context: twoComponentsSameDir }), [firstComponentContent, { file: 'FirstComponent.vue.js' }]);

    var secondComponentExpected = '<template src="' + twoComponentsSameDir + 'SecondComponent.vue.html" lang="html"></template>' +
      '<script src="' + twoComponentsSameDir + 'SecondComponent.vue.js" lang="js"></script>';
    var secondComponentResult = loader.apply(_.assign({}, webpack, { context: twoComponentsSameDir }), [secondComponentContent, { file: 'SecondComponent.vue.js' }]);

    assert.strictEqual(firstComponentResult, firstComponentExpected);
    assert.strictEqual(secondComponentResult, secondComponentExpected);
  });
});
