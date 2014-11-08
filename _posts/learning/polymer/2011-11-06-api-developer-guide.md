---
layout: post
title: Polymer学习笔记(API Developer Guide)
categories: learning polymer
---

[链接](https://www.polymer-project.org/docs/polymer/polymer.html)


> help make developing web components much easier


## 声明

使用`<polymer-element>`声明组件


## 属性

有一些保留的attributes用于描述组件  
如：*name, attributes, extends, noscript, constractor*
其他的属性将会自动应用到组件  
属性名的大小写是无关紧要的，polymer会聪明地应用到实际对象上


## 注册

```js
Polymer(tag-name, prototype)
```

## Custom element prototype chain


Polymer对象属性和方法的继承链：

1. prototype对象中定义的属性和方法
2. Polymer定义的基本属性和方法
3. HTML Element的属性和方法

所以为了避免冲突，请不要定义*id, children, focus, title, hidden*等属性和方法

> 结果不可预料 ？ <－－ 文档中是这么说的


## 属性的引用


在模板中 `$.globals.firstName`  
在js中 `this.$.globals.firstName`


## 生命周期


```js
{
  created: function() {},  
  ready: function() {},  
  attached: function() {},
  domReady: function() {},  
  detached: function() {},  
  attributeChanged: function(name, oldValue, newValue) {}
}
```

## polymer-ready

polymer解析定义，更新以及载入资源都是异步的，所以需要一个类似domready的事件来防止[FOUC](http://en.wikipedia.org/wiki/Flash_of_unstyled_content)

```js
$(window).on('polymer-ready', function() {
  var xfoo = $('x-foo')
})
```


## 公共属性

有两种方式声明公共属性

1. polymer-element节点中使用attributes属性 (推荐)
2. polymer构造器中使用publish

在节点中声明的好处是，一眼就能看出有哪些公共属性。   
不过当属性很多，需要默认值，以及使用*reflect*特性时，使用js的方式还是更方便。


默认属性是*undefined*, 可以使用以下两种方式声明默认值

```html
<polymer-element name="x-foo" attributes="bar">
  <script>
    Polymer({
      bar: false
    })
```

更简洁的方式

```html
<polymer-element name="x-foo">
  <script>
    Polymer({
      publish: {
        bar: false
      }
    })
```


> 对于属性类型为对象和数组的，需要在created回调方法中设置默认值，以保证每个组件有独立的实例数据


```html
<polymer-element name="x-defaults" attributes="settings">
  <script>
    Polymer({
      created: function() {
        this.settings = {
          textColor: 'blue'
        }
      }
    })
```

## property reflection

设置对象属性时，会自动传递到节点

`this.name = "Joe"  --> this.setAttribute('name', 'Joe')`

由于双向绑定机制，这个特性大多数情况下用不到，所以默认是关闭的

> property reflection和双向数据绑定不是一回事



## 数据绑定

核心特点，有整整一章介绍哦：）


## Computed properties


可以使用Polymer Expression来定义属性，这个属性也可以参于Data Binding哦。

```html
<template>
  <input type="number" value="{ {num}}" ...
  <em>{ {num}}^1 = { {square}}</em>
</template>
<script>
  Polymer({
    num: 2,
    computed: {
      square: 'num * num'   //  <-- Polymer Expression
    }
  })
</script>
```

## 声明式事件映射

```html
<template>
  <input on-click="{ {buttonClick}}"

<script>
  Polymer({
    buttonClick: function(event, detail, sender) {
    }
  })
```

## 属性监听

### 基于约定的属性监听机制


```html
<polymer-element properties="better">

  <script>
    Polymer({
      better: '',
      betterChanged: function(oldValue, newValue) {
      }
    })
```


### 自定义的属性监听

有时候基于约定还搞不定时，需要使用`observe`

```js
Polymer({
  observe {
    foo: 'validate',
    bar: 'validate'
  },

  validate: function(oldValue, newValue) {
  }
})
```


## 自动节点查找

有id的dom节点引用，可以通过`this.$.id` 引用得到


## 自定义事件

```js
Polymer({
  onClick: function() {
    this.fire('ouch', { ... })
  }
})


$('ouch-button').on('ouch', function(e) {
  e.type
  e.detail
});
```


## 扩展

```html
<polymer-element name="polymer-coller" extends="polymer-cool">
  <template>
    <shadow></shadow>  <!-- 调用父类模板 -->
  </template>
```

调用父类的方法

```js
Polymer({
  praise: 'cool',
  makeCoolest: function() {
    this.super()  // 调用父类方法
  }
})
```

这是如何实现的?  arguments.callee.caller ?


## 内置方法


### 监听原生dom子节点变化

```
onMutation(element, callback)
```

### 处理异步任务

> Polymer中到处都是异步，变化会先被收集，然后一次性处理，而不是每次都执行。
  这样就可以进行优化，并且防止重复的工作，并且减少不必要的FOUC

```js
this.async(function() {
  this.foo = 3  // this会自动绑定到节点对象
}, null, 1000)
```


### 延迟任务

```
this.responseChanged = function() {
  this.job('job1', function() {
    this.fire('done')
  }, 5000)
}
```

job可以避免重复操作，类似于我实现的schedule


## 高级主题

### 一些方法

```
this.cancelUnbindAll()
unbindAll()
preventDispose
```

### 数据变化如何传递


如果Object.observe()支持，则使用它来监听属性变化
如果不支持，则使用Platform.flash()来轮询检查变量


### Polymer Element如何初始化

从性能上考虑，element在created时，如果不在main document内，避免创建ShadowDOM, 进行事件监听，监控属性变化。  
这在行为上类似原生的img和video

在以下场景，element将会初始化

1. 当在main document中创建, document.defaultView存在
2. attached
3. 当它的shadowRoot节点被初始化时

alwaysPrepare属性可以强制初始化


### 路径问题

`this.resolvePath(x-foo.png)`

