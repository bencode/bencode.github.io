---
layout: post
title: AOP及其在Javascript中的应用
categories: javascript
---

## 两个例子

### 示例1

旺铺中有一些前端的方法，提供APP，模板，自定义样式的基本功能

```js
// 用于应用模板
TemplateService.apply(template)

// 应用自定义样式
CustomStyleService.apply(subject, data);

// 用于添加，载入，编辑，删除app
AppService.load(app)
AppService.edit(app)
AppService.del(app)
AppService.add(app)
```


有一个需求是：这些操作成功后，需要打个点

我们知道直接在这些实现中打点是不适合适的，因为打点不是这些功能“应有的逻辑”，而是“附加”的逻辑

一种不错的的方法是使用事件，比如旺铺以上这些操作都对应于事件

```js
page-template-apply
page-custom-style-update

app-load
app-save
app-delete
app.add
```


打点实现

```js
site.on('page-template-apply', function() {
  doTrace('...');
});
```

可以看到，原先我们可能需要在基础代码中进行打点，而现在通过一个observer “倒置”了依赖，让打点依赖于这些事件


再看另一种“邪恶”一点的实现, 我们直接看一下代码

在template-service.js中

```js
var TemplateService = {
  apply: function() {
  }
};
```


在另一个打点文件中

```js
var _apply = TemplateService.apply;
TemplateService.apply = function() {
  var defer = _apply.apply(this, arguments);
  defer.done(function() {
    doTrace();	// 应用成功后我们打个点
  });
  return defer;
};
```

对第二种情况分析下：

1. 原来的模块不需要依赖业务模块，还是那么干净，而且如果单为实现这个功能，连事件都不需要
2. 写以上代码时，你会感觉有点害怕


### 示例2

有时候我们需要对一些第三方库fix，比如我们对Number#toFixed进行一些修改以支持价格展示

比如旺铺中为了更好地规划jQuery的构造，context不能为空

```js
var node = $('div.panel', context);
var node = $('.panel');   // 在开发时应该提示一些警告，说最好带上tag以及context
```

示例代码

```js
if (may.log.isEnabled('info')) {

  var orijQuery = jQuery,
    ...;

  jQuery = function(selector, context) {
    if (typeof selector === 'string' && 
        selector !== 'body' &&
        !/^\s*</.test(selector) && 
        !/^#/.test(selector)) {

      if (context === undefined) {
        warn('please specify context for '+ selector + ' in ', 
            arguments.callee.caller);
      }

```

我们在日志级别为info时疯狂了一把,
然后开发时代码就会帮我们检查了。

总结：

1. 在方法执行后执行一段逻辑
2. 重写方法，执行自己的逻辑


## 词汇

连接点(join point)
切入点(pointcut)
通知(Advice)
Aspect
编织(weaving)


## Aspect模块简介

静态方法

```js
Aspect.before(target, pointcut, advice)
Aspect.after(target, pointcut, advice)
Aspect.around(target, pointcut, advice)
```

实例方法

```js
Aspect#before(target, pointcut, advice)
Aspect#after(target, pointcut, advice)
Aspect#around(target, pointcut, advice)

Aspect#attach()
Aspect#detach()

Aspect#isDetached
```

## 实践


### 示例1


```js
define('demo.Page', ['jQuery', 'Log', 'lang.Aspect', 'ui.Dialog'], 

function($, Log, Aspect, Dialog) {


var log = new Log('demo.Page');

var aspect = new Aspect();
  
return {
  init: function(div) {
    var self = this;
    div.on('click', 'a[data-action]', function(e) {
      e.preventDefault();

      var action = $(this).data('action');
      log.info(action)
      self[action]();
    });
  },

  onAlert: function() {
    alert('Hello');
  },

  onBefore: function() {
    aspect.before(window, 'alert', function(o) {
      var title = o.args[0];
      return ['Before ' + title];
    });
  },

  onAfter: function() {
    aspect.after(window, 'alert', function(o) {
      var _alert = o.method;	
      _alert(o.args[0] + ' After');
    });
  },

  onAround: function() {
    aspect.around(window, 'alert', function(o) {
      Dialog.info(o.args[0]);
    });
  },

  onAttach: function() {
    aspect.attach();
  },

  onDetach: function() {
    aspect.detach();
  }

};
  
});
```


### 示例2


HtmlParser结构

```js
var HtmlParser = {
  parse: function(),
  parseNode: function(),
  parseComment: function(),
  parseElement: function(),
  parseTag: function(),
  parseAttribute: function(),
  parseText: function()...
}
```

Visitor结构

```js
var Visitor = {
  visitNode: function(node) {
    console.debug(node);
  },

  visitComment: function(comment) {
    console.debug(comment);
  },

  visitElement: function(elm) {
    console.debug(elm);
  },

  visitTag: function(tag) {
    console.debug(tag);
  },

  visitAttribute: function(attr) {
    console.debug(attr);
  },

  visitText: function(text) {
    console.debug(text);
  }
};
```

parse和parseWithVisit

```js
  init: function(div) {
    $('a.parse', div).on('click', $.proxy(this, 'parse'));
    $('a.parse-with-visit', div).on('click', $.proxy(this, 'parseWithVisit'));

    this.text = $('textarea.html-text', div);
  },

  parse: function() {
    var parser = new HtmlParser(this.text.val());
    var o = parser.parse();
    console.debug(o);
  },

  parseWithVisit: function() {
    var parser = new HtmlParser(this.text.val());
    
    this.weave(parser);
    
    parser.parse();
  },

  weave: function(parser) {
    Aspect.after(parser, /^parse\w+/, function(o) {
      var name = o.name,
        visitName = 'visit' + /^parse(\w+)$/.exec(name)[1];
      
      Visitor[visitName] && Visitor[visitName](o.result);
    });
  }

```


## 注意

1. OOP 和 AOP 

	OOP: 处理核心逻辑

	AOP： 处理切面逻辑

2. 执行流程比较难理解
3. 破坏了封装性
