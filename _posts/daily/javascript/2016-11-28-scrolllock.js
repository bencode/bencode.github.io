---
layout: post
title: scroll lock
categories: javascript
---

内部层滚动时不希望触发window scroll，可以参考 [jquery-scrollLock](https://github.com/MohammadYounes/jquery-scrollLock)实现
只要是监听了`wheel`, `touchstart` 和`touchmove` 然后自行处理滚动，感觉自行处理滚动不是很好，最好是使用默认的滚动，只要不触发
window滚动那就最好了。
