---
layout: post
title: 关于jQuery几个重要的知识点
categories: javascript
tags:
  - jquery
---

关于jQuery比较重要的几个知识点。


## 1. 理解jQuery的设计原则

共有两类API，一类是**静态函数**，一类是**实例方法**。  
http://api.jquery.com/ 这里面有完整的API列表，其中`jQuery.`开头的都是静态函数，点开头的都是实例方法。  
需要**DOM节点参于**的函数都需要实现成**实例方法**。


## 2. 知道如何扩展jQuery。

静态函数参考以下示例实现。

```js
jQuery.hello = function() {
  alert('hello world!');
};

// 这样使用
jQuery.hello();
```

<!--more-->

以上代码很容易理解。

实例方法可以参考以下示例实现：

```js
// 把一个节点文字变成红色
jQuery.fn.red = function() {
  this.css('color', 'red’);  // 这里面的this就是当前的jQuery对象
};

// 使用时可以这样
$('.panel').red();
```

`jQuery.fn` 实际上就是 jQuery.prototype，可以在`Console`中校验

```js
jQuery.fn === jQuery.prototype
```



## 3. 掌握构造函数

即jQuery是一个函数，这个函数用于构造一个jQuery对象，这个函数功能比较强大，要熟练掌握各种不同类型的参数。

参考 http://api.jquery.com/jQuery/ 这个文档可以知道这个函数有哪些特性。  

以下示例把每种情况用了一下，可作参考：


```js
$('.close');    // 根据选择器构造

$('body');      // document.body

var panel = $('.panel');
$('.close', panel);    // 只在panel中找，相当于`panel.find('.close')`

var elm = document.getElementById('doc');
$(elm);    // 将dom节点包装成jQuery对象


var elms = document.querySelectorAll('.item');
$(elms);   // 将DOM节点列表`NodeList`包装成jQuery对象


// 空的也可以，用于一些特殊情况，比如先构造一个空的，后面再往里追加
$();


var node = $('<div />');  // 将HTML直接包装成jquery对象
var node2 = $('<div class="..." />... </div>');   // 可以是很复杂的HTML
var node3 = $('<div>', { id: '...' });      // 构造时还可以传递属性


// 以下方法用于响应 domready 事件，不返回jquery对象
$(function() {
  // 初始化页面
});
```

## 4. 掌握jQuery对象结构

`jQuery`对象，是个**类数组**，具有数组一般的API，因此可以像数组一样使用。

```js
var links = $('a');

for (var i = 0; i < links.length; i++) {
  var link = links[i]        // 这里得到的是当前索引的DOM对象，不是jQuery对象。
  link.css.color = 'red';    // 直接操作dom对象
}
```

当然一般来说，我们使用`.each`方法迭代jQuery对象。

```js
var links = $('a');

links.each(function(index) {
  // index 就是索引的位置
  this.css.color = 'red'    // 这个this就是当前的DOM节点
});
```

可以在`Console`中展开其对象，会得到类似下同的结构。

```js
{
  0: dom0
  1: dom1
  2: dom2
  ...

  length: 100,
  selector: 'span':
}
```

理解以上结构对于使用jQuery会有帮助。


## 5. DOM节点和jQuery对象的互转

```js
var elm = $('.close');    // 得到一个jQuery对象

elm[0];       // 拿到DOM节点
elm.get(0);   // 同上


var items = $('.item');   // 如果.item不止一个，那么会得到包含一组DOM节点的jQuery对象
items[0];     // 得到第一个节点
items.eq(i);    // 得到第i个节点，并将它包装成`jQuery`对象。


var item3 = items[3];   // dom节点
items3 = $(item3);      // 将DOM包装成jquery对象
```


## 6. 链式调用

jQuery实例方法操作后一般都会返回当前jQuery对象，或者返回一个新的jQuery对象，因此可以进行**链式操作**。

```js
var elm = $('.btn');

elm.addClass('active')
  .css({ color: 'red' })
  .text('我是按扭');
```

## 7. 批量操作

jQuery的操作一般是批量的，所以多数情况下不需要循环。

```js
var items = $('.items');
items.removeClass('active');    // 对集合中的所有操作，而不仅仅是第一个。
```


## 8. 事件操作

有两种事件形式，一种是**普通事件绑定**，一种**事件代理方式绑定**。  
要理解**事件代理**方式的**实现原理**和**使用场景**。


```js
$('.show .close').on('click', function(evt) {
  evt.preventDefault();
  // this 就是.close这个按扭
});
```

这里面有两个重点

1. `evt` 事件参数。可以通过它获得事件信息，如鼠标位置等，也可以通过它调用`evt.preventDefault()`和`stopPropagation()`等方法。
2. `this` 指向事件源的DOM节点，这在同时绑定多个节点时比较有用。

```js
$('li').on('mouseenter', function() {
  $(this).addClass('hover');
}).on('mouseleave', function() {
  $(this).removeClass('hover');
});
```

### 事件代理方式绑定事件。

```js
$('.list').on('click', 'li', function() {
  var li = $(this);
});
```

这主要用在两种场景下：

1\. 有非常多的节点需要绑定事件，比如一个表格，我需要点击单元格时需要根据所点的单元格来操作。  

```js
$('.mytable').on('click', 'td', function() {
  var td = $(this);
  var text = td.text();
  console.log(text);
});
```

以上是绑定在表格上的，如果直接绑定在`td`上，可能会非常慢。


2\. 节点可能是动态产生的，比如一开始打开页面时，这些节点不存在，是后来产生的，这时候使用事件代理绑定就比较方便。


## 9 .data() 的使用。

`data()` 方法可以将节点和数据关联, 主要有两个作用：

1\.  将后端的数据通过HTML传给JS

```html
<div class="panel" data-url="http://www.google.com" />
```

```js
var url = $('.panel').data('url');
// 可以得到`data-url`属性的内容。
```

还可以是个`JSON`对象

```html
<div class="book" data-book='{"name": "A book"}' />
```

```js
var book = $('.book').data('book');
book.name === 'A book'    // book直接得到的是对象
```

2\. 将数据和节点相关联，事件操作时可以找到对应的数据。

```js
// 有好多本书
var books = [
  { name: 'book 1', price: 12 },
  { name: 'book 2', price: 22 },
  { name: 'book 3', price: 17 },
  { name: 'book 4', price: 35 },
];

// 渲染一个列表到页面
var panel = $('.panel');
books.forEach(function(book) {
  var item = $('<li>')
  item.text(book.name);
  item.data('book', book);    // <--- 将book存在这个节点上
  panel.append(item);
});


panel.on('click', 'li', function() {
  var book = $(this).data('book');    // 取到点击的那个book数据
  console.log(book.price);
});
```

