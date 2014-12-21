---
layout: post
title: Hammer.js默认情况下会preventDefault的解决
categories: javascript
---

默认情况下, hammer.js会preventDefault，这会阻止原生的滚动等行为。
这在大多数情况下没什么问题，但有些情况下我们需要这类行为时，由于它没有开放相应的参数，就比较麻烦。

不过也不是不能解决，通过阅读源码，找到以下解决方案：


```js
var mc = new Hammer.Manager();
mc.add(...)

mc.touchAction.preventSrc = function() {
    // 什么都不做
};
```

