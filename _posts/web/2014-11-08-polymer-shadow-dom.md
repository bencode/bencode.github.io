---
layout: post
title: Polymer学习笔记4 - Shadow DOM
categories: web component polymer
---

## 基本使用


```js
var el = document.createElement('div')
var shadow = el.createShadowRoot()
shadow.innerHTML = '<content select="q"></content>'
document.body.appendChild(el)
```


## subtrees

一个节点承载三棵树： light DOM, shadow DOM 和 composed DOM

组件提供者创建shadow DOM, 使用者提供light DOM， 然后浏览器结合两者成为composed DOM进行渲染。 
shadow DOM不能被用户访问到，它有自己的空间。 
这本质上是一种封装和开放，设计上的艺术。


## Polyfill

原生不支持ShadowDom的浏览器，可以使用ShadowDOMPolyfill来包装，只是即使这样，也有若干限制。

### 事件重定向

### 已知的缺陷

- css封装性
- Object.prototype.toString和原生支持的返回不一致
- document, window, document.body, document.head等不可配置，不能被重写
- 跨window, frame未实现
- :host()伪类选择器最多支持1层嵌套的括号选择器
例：`:host(.zot)` and `:host(.zot:not(.bar))` 支持, 
	`:host(.zot:not(.bar:nth-child(2)))` 不支持



[资料]

[https://www.polymer-project.org/platform/shadow-dom.html](https://www.polymer-project.org/platform/shadow-dom.html)
[https://dvcs.w3.org/hg/webcomponents/raw-file/57f8cfc4a7dc/explainer/index.html#shadow-dom-section](https://dvcs.w3.org/hg/webcomponents/raw-file/57f8cfc4a7dc/explainer/index.html#shadow-dom-section)
[http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom/](http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom/)
[http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom-201/](http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom-201/)
[http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom-301/](http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom-301/)
