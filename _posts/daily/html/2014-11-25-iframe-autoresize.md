---
layout: post
title: iframe自适应高度
categories: web
---

这两天项目中需要，上网搜了一把找到一大堆，最后使用下面的方案。
发现一个问题，就是onload时再触发有点太慢了，可以改用domready等事件，还好我这个自适应不在线上使用，只存在开发环境下的mock。


```js
var fn = function() {
  try {
    var bHeight = iframe.contentWindow.document.body.scrollHeight;
    var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
    var height = Math.max(bHeight, dHeight);
    if (height) {
      iframe.height = height;
    }
    setTimeout(fn, 200);
  } catch (e) {
    console.error(e);
  }
};

fn();
```

http://www.cnblogs.com/MaxIE/archive/2008/08/13/1266597.html
