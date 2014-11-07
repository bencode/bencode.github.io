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
