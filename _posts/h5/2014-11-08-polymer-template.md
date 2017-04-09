---
layout: post
title: Polymer学习笔记5 - HTML5 Template
categories: h5
tags:
  - web component
  - polymer
---

[参考资料](http://www.html5rocks.com/zh/tutorials/webcomponents/template/)


## 特性检测

```js
function supportTemplate() {
  return 'content' in document.createElement('template')
}
```

## 声明模板内容

```html
<template id="mytemplate">
  <img src="" alt="great image">
  <div class="comment"></div>
</template>
```

## 特性

1. 模板内容在激活前不会被渲染
2. 处于模板中的内容无副作用
3. 处理模板中的内容不在文档中
4. 模板可以放置在任意位置，包括`<head>, <body>, <frameset>`
  并且任何能够出现在以上节点中的内容都可以出现在`<template>`中
  template能够安全地出现在html解析器不允许出现的位置，几乎可以作为任何内容的子节点，如`<table>`和`<select>`


## 激活

```js
var t = document.querySelector('#mytemplate')
t.content.querySelector('img').src = 'logo.png';

var clone = document.importNode(t.content, true);
document.body.appendChild(clone);
```