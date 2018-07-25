# Vue separate files Webpack loader

[![npm](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com/package/vue-separate-files-webpack-loader)
[![npm](https://img.shields.io/npm/l/express.svg)](https://www.npmjs.com/package/vue-separate-files-webpack-loader)
[![Build Status](https://travis-ci.org/NetCZ/vue-separate-files-webpack-loader.svg?branch=master)](https://travis-ci.org/NetCZ/vue-separate-files-webpack-loader)
[![Coverage Status](https://coveralls.io/repos/github/NetCZ/vue-separate-files-webpack-loader/badge.svg)](https://coveralls.io/github/NetCZ/vue-separate-files-webpack-loader)
[![Known Vulnerabilities](https://snyk.io/test/github/netcz/vue-separate-files-webpack-loader/badge.svg?targetFile=package.json)](https://snyk.io/test/github/netcz/vue-separate-files-webpack-loader?targetFile=package.json)
[![Maintainability](https://api.codeclimate.com/v1/badges/eeb26dd14d1b50a6ea2f/maintainability)](https://codeclimate.com/github/NetCZ/vue-separate-files-webpack-loader/maintainability)
[![Greenkeeper badge](https://badges.greenkeeper.io/NetCZ/vue-separate-files-webpack-loader.svg)](https://greenkeeper.io/)

Creates `.vue` single file components on fly, allowing you to have clean separated components files and still enjoy 
advantages of [vue-loader](https://github.com/vuejs/vue-loader).

- Handles files by their names (instead of loading all files in folder) and creates `.vue` file on fly (instead of 
creating physical one)
- Allows to add custom attributes through `options.global`, `options[FILE_TYPE]` and `options[TAG_NAME]`
- Allows to handle [vue custom blocks](https://vue-loader.vuejs.org/en/configurations/custom-blocks.html)
- Allows to have `scoped` style by component
- Allows to define support for other file extensions / types
- Allows to define test condition for loader (eg. `.vue.`, etc.)

> Based on these ideas [vue-builder-webpack-plugin](https://github.com/pksunkara/vue-builder-webpack-plugin) and 
[vue-separate-files-loader](https://github.com/iFwu/vue-separate-files-loader).

## Example application

See [this](https://github.com/NetCZ/vue-separate-files-webpack-loader-example) repository.

## Install
```bash
npm i -D vue-separate-files-webpack-loader
```
or
```bash
yarn add -D vue-separate-files-webpack-loader
```

## Usage

**VueLoader v15 onward**\
As [vue-loader](https://github.com/vuejs/vue-loader) introduced mandatory plugin usage in version 15, 
which updates webpack rules, there's need to use plugin provided by `vue-separate-files-webpack-loader/plugin` in order to work 
with this version onward.

**VueLoader v14 and below**\
Just don't include `vue-separate-files-webpack-loader/plugin` to your webpack configuration.

### Configuration

#### Simple
```javascript
// webpack.config.js

const VueSeparateLoaderPlugin = require('vue-separate-files-webpack-loader/plugin')

module.exports = {
  module: {
    rules: [
      {
        // notice modified file test
        test: /\.vue\./,
        use: [
          {
            loader: 'vue-loader'
          },
          {
            loader: 'vue-separate-files-webpack-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    // mandatory from VueLoader v15 onward
    // has to be added AFTER "new VueLoaderPlugin()"
    // available options below
    new VueSeparateLoaderPlugin(options),
  ]
}
```

#### Complex (with options definition)
```javascript
// webpack.config.js

const VueSeparateLoaderPlugin = require('vue-separate-files-webpack-loader/plugin')

module.exports = {
  module: {
    rules: [
      // regular VueLoader definition
      // use it when you want to use both component styles, otherwise you may omit it
      // ie SFC: Component.vue and Separated: Component.vue.html Component.vue.js
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // VueSeparateFilesWebpackLoader definition
      {
        // notice modified file test
        test: /\.vue\./,
        use: [
          {
            loader: 'vue-loader',
            options: {/* usual vue-loader options */}
          },
          {
            loader: 'vue-separate-files-webpack-loader',
            options: {
              // add support for other file types
              types: {
                script: '\\.re$',
                template: '\\.hb$'
              },
              global: {
                // all files will have these
                attr: 'value'
              },
              sass: {
                // only SASS files will have these
                attr: 'value'
              },
              style: {
                // only style files will have these
                attr: 'value'
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // mandatory from VueLoader v15 onward
    // has to be added AFTER "new VueLoaderPlugin()"
    // available options below
    new VueSeparateLoaderPlugin(options),
  ]
}
```

#### With VueCLI 3 generated project

```javascript
// vue.config.js

const VueSeparateFilesWebpackLoaderPlugin = require('vue-separate-files-webpack-loader/plugin')

module.exports = {
  chainWebpack: config => {
    config
      .plugin('vue-separate-files-webpack-loader')
      .use(VueSeparateFilesWebpackLoaderPlugin, [options])
      .after('vue-loader')

    config.module
      .rule('vue-separate-files-webpack-loader')
      .test(/\.vue\./)
      .use('vue-loader')
        .loader('vue-loader')
        .end()
      .use('vue-separate-files-webpack-loader')
        .loader('vue-separate-files-webpack-loader')
  }
}
```

#### Plugin options

Passed as regular `Object`.

| Option| Default value | Description |
| :--- | :--- | :--- |
| test | `/\.vue\./` | When you use different file test condition in loader definition than default `/\.vue\./`, you have to define it also in plugin options. |

##### Example

```javascript
// webpack.config.js

const VueSeparateLoaderPlugin = require('vue-separate-files-webpack-loader/plugin')

module.exports = {
  module: {
    rules: [
      {
        test: /\.condition\./,
        use: [
          {
            loader: 'vue-loader'
          },
          {
            loader: 'vue-separate-files-webpack-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new VueSeparateLoaderPlugin({
      test: /\.condition\./
    })
  ]
}
```

### Supported file extensions / types

These file extensions are supported and automatically assigned to proper tag type by default.

- `html`, `jade`, `pug`
- `js`, `jsx`, `coffee`, `ts`, `tsx`
- `css`, `sass`, `scss`, `styl`, `less`

You can add support for other file extensions simply by adding following to loader configuration.
```javascript
types: {
  script: '\\.re$|\\.oj$' // add support for ".re" and ".oj" extensions for "script" type 
}
```

> **IMPORTANT!** configurations are MERGED together, so there is no way do remove default configuration

### How it works

Loader check files with `.vue.` within the name and creates actual `.vue` file structure on fly

#### Example

Taken this component structure

```
Component.vue.js
Component.vue.scoped.scss
Component.vue.pug
```

Generated structure

```html
<template src="Component.vue.pug" lang="pug"></template>
<style src="Component.vue.scss" lang="scss" scoped></style>
<script src="Component.vue.js"></script>
```

This generated string is then passed to `vue-loader`

### Custom block support

Loader allows to use **vue custom blocks**. 
Simply define file and its extension will be used as tag name.

#### Example

Component file

```
Component.vue.docs
```

Generated structure

```html
<docs src="Component.vue.docs"></docs>
```
