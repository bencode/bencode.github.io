---
layout: post
title: Polymer学习笔记 - Helper Methods
categories: learning polymer
---

## 动态Html imports

```js
Polymer.import(urls, callback)
```

```js
<dynamic-element>
  I'm just an unknown element.
</dynamic-element>

<script>
  var button = document.querySelector('button')
  button.addEventListener('click', function() {
    Polymer.import(['dynamic-element.html'], function() {
      document.querySelector('dynamic-element').description = 'a dynamic import'
    })
  });
</script>
```

## mixins

```js
Polymer.mixin(target, obj1 [, obj2, ..., objN ] )
```

## 强制注册元素

默认情况下，Polymer会等待所有元素ready, 再进行注册和更新。 
如果一个元素没有调用Polymer构造函数，也没有使用noscript属性，则它会一直等待。 
Polymer.waitingFor帮助方法返回一个阻塞状态的polymer-element列表。  
Polymer.forceReady通知Polymer强制注册所有已ready的元素，忽略未完成的元素。
