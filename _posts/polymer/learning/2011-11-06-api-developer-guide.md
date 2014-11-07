---
layout: post
title: Polymer 学习记录(API Developer Guide)
categories: polymer learning
---

[链接](https://www.polymer-project.org/docs/polymer/polymer.html)


> help make developing web components much easier


## 申明

使用<polymer-element>申明组件


## 属性

有一些保留的attributes用于描述组件  
如：*name, attributes, extends, noscript, constractor*
其他的属性将会自动应用到组件上  
属性名的大小写是无关紧要的，polymer会聪明地应用到实际对象上


## 注册

```
Polymer(tag-name, prototype)
```

## Custom element prototype chain

1. prototype对象中定义的属性和方法
2. Polymer定义的基本属性和方法
3. HTML Element的属性和方法

所以为了避免冲突，请不要定义*id, children, focus, title, hidden*等属性和方法

> 结果不可预料 ？ <－－ 文档中是这么说的


## 属性的引用


在模板中 `$.globals.firstName`  
在js中 `this.$.globals.firstName`


## 生命周期


```
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

```
$(window).on('polymer-ready', function() {
  var xfoo = $('x-foo')
})
```


## 公共属性

有两种方式申明公共属性

1. polymer-element节点中使用attributes属性 (推荐)
2. polymer构造器中使用publish

在节点中申明的好处是，一眼就能看出有哪些公共属性。   
不过当属性很多，需要默认值，以及使用*reflect*特性时，使用js的方式还是更方便。


默认属性是*undefined*, 可以使用以下两种方式申明默认值

```
<polymer-element name="x-foo" attributes="bar">
  <script>
    Polymer({
      bar: false
    })
```

更简洁的方式

```
<polymer-element name="x-foo">
  <script>
    Polymer({
      publish: {
        bar: false
      }
    })
```


> 对于属性类型为对象和数组的，需要在created回调方法中设置默认值，以保证每个组件有独立的实例数据


```
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

## Computed properties



