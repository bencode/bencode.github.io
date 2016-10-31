---
layout: post
title: 优化webpack编译速度
categories: javascript
tags: webpack npm yarn
---


## 定位问题

运行webpack时添加以下参数可以知道每一步的耗时。

```
webpack --colors --profile --display-modules
```


## noParse

不需要再分析依赖的模块可以加到noParse中，特别是一些比较大的模块，比如lodash和moment。

配置前：

```
Hash: 1ebe657f7141dd33e9de
Version: webpack 2.1.0-beta.25
Time: 63341ms
```

添加配置后：

```js
  module: {
    noParse: [
      /node_modules\/moment\//,
      /node_modules\/lodash\//
    ],
```

```
Hash: c779a668485b650971c0
Version: webpack 2.1.0-beta.25
Time: 51897ms
```


## loader exclude

配置前:

Hash: c779a668485b650971c0
Version: webpack 2.1.0-beta.25
Time: 56239ms


添加配置后：


```js
  module: {
    loaders: [
      {
        test: /\.js$/,

        exclude: function(path) {
          const isNpmModule = !!path.match(/node_modules/);
          const isHljModule = !!path.match(/node_modules\/@hlj/);
          return isNpmModule && !isHljModule
        },
```

Hash: fea7318458effdd97ccf
Version: webpack 2.1.0-beta.25
Time: 25038ms


## source map

尝试后发现还是使用`eval-source-map`好调试，所以保持不变。


## OPTIMIZATION

让优化代码的webpack插件只作用在生产环境，平常开发时不开启。  
这一步我们本来就做得不错，所以不需要修改。  
我们主要使用了以下插件：

- DedupePlugin
- ContextReplacementPlugin
- UglifyJsPlugin
- Visualizer
- OccurrenceOrderPlugin
- AggressiveMergingPlugin
- NoErrorsPlugin


# 配置cacheDirectory

这一步可以大大提升编译速度。

配置前：


Hash: fea7318458effdd97ccf
Version: webpack 2.1.0-beta.25
Time: 21685ms


配置后：


```
  loaders: [
    {
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015', 'stage-0'],
        cacheDirectory: true
      }
    }
```

Hash: fea7318458effdd97ccf
Version: webpack 2.1.0-beta.25
Time: 12422ms


所以经过简单的配置，我们的编译时间从原来的 **63s** 降到 **12s**。


## 参考文档

https://segmentfault.com/a/1190000005770042
https://medium.com/@lcxfs1991/webpack-performance-the-comprehensive-guide-4d382d36253b#.56n46hlo
http://code.oneapm.com/javascript/2015/07/07/webpack_performance_1/

