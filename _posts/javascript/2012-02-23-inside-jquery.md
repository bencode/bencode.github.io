---
layout: post
title: Inside jQuery
categories: javascript
---


### jQuery.fn.init处理流程  [99]

构造jQuery对象时，会转交给jQuery.fn.init处理。所以先看看它的处理流程, 就能够知道有几种方式调用jQuery方法，也知道内部的一些细节。

```js
1. $(dom)
  this.context = this[0] = dom
  this.length = 1;
  return this;


2. $('body') 
  this[0] = document.body
  this.length = 1;
  return this;


3. $(html)
  细节点: 下面两者等效，即会过滤前后非tag内容
  $('1212<div>...</div>dfdf') -> $('<div>...</div>')

  1. single tag: '<div>', '<div />', '<div></div>'
    1. document.createElement

    2? $('<a>', {
        id: 'mydiv',
        href: '...',
        target: '_blank'
      })
        
      jQuery.fn.attr.call(elm, attrs)

  2. else 
    jQuery.buildFragment

4. $('#id')
  document.getElementById

5. $(selector) -> $(document).find(selector)
   $(selector, jq) -> jq.find(selector)
   $(selector, context) -> $(context).find(selector) 


7. $(function) -> $(document).ready(function)


8. $(jq) -> 创建一个新的jq对象
  this.selector = jq.selector
  this.context = jq.context
```


### 关于this.context和this.selector

context是jQuery对象的一个属性值, 一般情况下不需要知道它是什么， 但要深刻理解冒泡事件，就要知道它的值，现在仅列一下。

```
1. $(!selector)
  context: undefined

2. $(dom)
  context: dom

3. $('body')
  context: document
  selector = 'body'

4. $(html)
  context = undefined
  selector = ''
  
5. $('#id')
  context = document
  selector: selector
```

### core

一些方法的备注

#### 1. get() -> toArray() 
无参数调用get,返回原生节点数组


#### 2. end() -> this.prevObject || $(null)
调用end()返回this.prevObject或空的jQuery对象

关于prevObject看下面jQuery对象结构图

#### 3. pushStack 

会生成一个新的jQuery对象, 并设置prevObject指向当前jQuery对象，返回生成的jQuery对象。
jquery方法中，如果是生成一个新的jQuery对象，一般会调用pushStack构造新的对象，如 find, slice等。

熟悉以下对象结构图，有助于更好地理解jQuery, 也能知道和评估它的成本

![jQuery对象结构图](/assets/javascript/inside-jquery/01.png)


### extend

这个方法太常用了，也太好用了， 有些边界情况记录一下
	
#### 1. 只有一个参数的情况，表示添加到当前对象

```js
$.extend({...}) -> $.extend($, {...})
$.fn.extend({...}) -> $.extend($.fn, {...})
```

#### 2. null/undefined的参数将会忽略

```js
$.extend({}, { number: 123 }, null, { other: 'me' });
```

#### 3. undefined的字段将会忽略

```js
$.extend({}, { a: 123, b: undefined });
```

结果中并不包含b字段，**注：null字段还会存在的**，当然使用时不要太依赖这边边界。


#### 4. 参数类型为array时，将依据index进行合并

这个特性其实不是很好，可能会产生误解

```js
$.extend(true, { a: [1, 2, 3] }, { a: [2, 3] });
```

结果为 { a: [2, 3, 3] }, 不是 { a: [1, 2, 3, 2, 3] } 哦 


### holdReady -- from jquery1.6

延迟domready的执行, 做性能优化的同学可以考虑这个方法的使用场景


### domready

下面是domready的原理
	
1. 先检查document.readyState === 'complete'
2. 标准浏览器
	document.addEventListener('DOMContextLoaded',
	保险起见, 再注册
	window.addEventListener('load',
3. IE
	document.attachEvent('onreadystatechange',
	保险起见, 再注册
	window.attachEvent('onload',

	// 在IE下，如果非iframe, 则可做一定优化
	document.documentElement.doScroll('left')可调用, 则dom肯定ready了


### $.type 用于查看某个对象的类型

原理: 
toString.call(obj) --> 再查表


### $.isArray, $.isPlainObject
jQuery提供的类型判断中，最常用的有以上两个，其他的直接使用typeof 都能搞定


### parseJSON

实现中：原生支持使用原生，否则创建一个Function运行
1. window.JSON
2. new Function(...)();

### noop 空操作函数引用
用这个可以减少每次空函数产生的内存

### globalEval

实现方案：如果存在window.execScript则使用它执行否则使用eval
1. window.execScript
2. eval


### each
return false 相当于break


### trim

原生支持的话使用原生，否则使用正则式, 注意正则式技巧
1. string#trim
2. 用两个正则式分别replace前后两段空白

### inArray 

实现中：如果原生支持indexOf则直接使用, 否则自己处理
1. array.indexOf
2. ... 


### grep 
支持第3个参数inv, 即选出callback为false的元素

### map
1. 如果返回值为null/undefined，则不被添加到集合中

```js
$.map([1, 2, 3], function(v) { return v === 2 ? null : 2 * v  });
[2, 6]
```

2. 如果返回值是个数组，则“打散”后再添加到集合中

```js
$.map([1, 2, 3], function(v) { return [1, 2, 3] });
[1, 2, 3, 1, 2, 3]
```

### proxy(fn, context, ...)

这个方法常常被我用于“减少缩进”

```js
var A = {
  init: function() {
    var self = this;
    $.ajax(url, {
      data: ...
      success: $.proxy(self, 'success');
    });	
  },

  success: function() {
    ...
    this.render();
  },

  render: ...
};
```

1. 前面这种形式的调用相当于... 
proxy(object, 'name') ---> proxy(object[name], object)

2. 可传递额外的参数

```js
var f = function(num, e) {
	e.preventDefault();
	console.debug(num);
}; 

btn1.click($.proxy(f, 123));
btn2.click($.proxy(f, 456));
```

额外参数会加到前面哦


### access
 这个方法在jQuery内部使用, 当需要设置/获取属性时
 如： attr, css, prop, val等将会统一调用access， 所以这些个方法会有一致行为


### Callbacks
 1. jquery1.7提供，用于统一callback list的使用。如jq内部的Deferred使用了Callbacks
    可以使用它方便observer等模式的书写。
	
```js
var A = {
  
  init: function() {
    this.fire(1, 2, 3);
  }
    
};
$.extend(A, $.Callbacks());


A.add(function() {
  console.debug('a', arguments);
});
A.add(function() {
  console.debug('b', arguments); 
});

A.init();
```	
	

2 callbacks对象的add/remove/fire等等方法支持detach的
	  
```js
add = callbacks.add;
add(); // 这样是能够正常使用的
```

所以以上例子可以更改为

```js
var B = {
  init: function() {
    this.publish(1, 2, 3);
  }
};
var proxy = $.Callbacks();
$.extend(B, {
  publish: proxy.fire,
  subscribe: proxy.add
});

B.subscribe(function() {
  console.debug('a', arguments); 
});
B.subscribe(function() {
  console.debug('b', arguments);  
});
B.init();
```
这样仅向B暴露需要的方法


3 可以构造不同类型(行为)的Callbacks，目前有 once memory stopOnFalse unique, 他们可以组合使用
  具体可以参看文档：http://api.jquery.com/jQuery.Callbacks


### Deferred

根据 http://wiki.commonjs.org/wiki/Promises/A 引入一种更好的方式来管理回调方法的使用

#### 1 参数中添加回调 

```js
//正常用法
$.ajax('mock.php', {
  dataType: 'jsonp',
  success: function(o) {
    console.debug(o); 
  } 
});
```

#### 2 使用promise接口

```js
var o = $.ajax('mock.php', { dataType: 'jsonp' });

o.done(function(o) {
  console.debug('success1', o); 
});

o.done(function(o) {
  console.debug('success2', o); 
});


var o = $.ajax('error.php', { dataType: 'jsonp' });
o.fail(function(e) {
  console.debug('error', e); 
});
o.always(function() {
  console.debug('complete'); 
});


var o = $.ajax('mock.php', { dataType: 'jsonp' });
o.then(function() {
  console.debug('success');
}, function() {
  console.debug('error');
});
```


#### 3 使用$.when, 当几个并行任务运行完毕

```js
var url = 'mock.php',
  a1 = $.ajax(url, { dataType: 'jsonp' }),
  a2 = $.ajax(url, { dataType: 'jsonp' }),
  a3 = $.ajax(url, { dataType: 'jsonp' });

$.when(a1, a2, a3).done(function() {
  console.debug('all complete');  
});
```

```js
var urls = [...],
  promise = $.when($.map(urls, function(url) {
    return $.ajax(url, { dataType: 'script', cache: false });	
  }));

promise.done(function() {
    
});
```

#### 4.使用pipe，几个任务需要串行运行

第二个请求依赖第一个请求，要完成后才能发

```js
var request = $.ajax('mock.php', { dataType: 'jsonp' }),
  chained = request.pipe(function(o) {
    return $.ajax('mock', { dataType: 'jsonp', data: { o: o.data } }); 
  });

chained.done(function(o) {
  console.debug(o); 
});
```


这么多请求顺序发, 因为后者使用到前者数据

```js
var urls = [
  'mock.php',
  'mock.php',
  'mock.php',
  'mock.php'
];

var promise = $.when();
$.each(urls, function(index, url) {
  promise = promise.pipe(function(o) {
    return $.ajax(url, { 
      dataType: 'jsonp', 
      data: { index: index, o: o && o.data } 
    });
  });
});
promise.done(function(o) {
  console.debug('all complete');
}
```

#### 5 使用Deferred

如何等待几个任务运行完毕，而又分离任务，让他们互不依赖

```js
var CountDown = function(promise) {
  var span = $('span.countdown'),
    num = 15,
    render = function() {
      span.text(num);
      if (num === 0) {
        promise.resolve();
      } else {
        setTimeout(render, 1000);
      }
      num--;
    };

  render();
};


var RemoteHtml = function(promise) {
  var div = $('div.remote-html');
  div.html('loading...');

  $.ajax('remote-html.php').done(function(html) {
    div.html(html);
    promise.resolve();
  });
};


var ClickMe = function(promise) {
  var btn = $('input.click-me'),
    num = 10;
  btn.val(num);

  btn.on('click', function() {
    num--;
    if (num >=0) {
      btn.val(num);
      if (num === 0) {
        promise.resolve();  
      }
    }
  });
};


var tasks = [CountDown, RemoteHtml, ClickMe];
$.when.apply($, $.map(tasks, function(task) {
  return $.Deferred(task);  
})).done(function() {
  alert('全部干完了');
});
```


### data

#### data 数据结构

```html
<div id="mydiv1"></div>
<div id="mydiv2"></div>

<script>
$('#mydiv1').data('someData1', 'some data 1 value');
$('#mydiv1').data('some-data-2', { name: 'hello' });

$('#mydiv2').data('someData3', [1, 2, 3]);
</script>
```

![data数据结构](/assets/javascript/inside-jquery/02.png)

我们用户的数据存在名叫data的域中，jQuery内部很多地方使用了这个jQuery.cache。
如queue, event(下面会讲), 以及其他方法中的一些标识。
如 html5的data是存已被cache等信息都存在jQuery.cache中，所以了解它将有助于我们排错。

#### acceptData [1672]

内部使用accpetData检查元素是否允许使用data， 有三种元素不能使用：

```html
embed
非flash object
applet
```

设置时，名称将会被转成camelCase，获取时如果直接获取不到, 则会尝试将名称转成camelCase再次获取

 所以目前

```js
elm.data('a-b', 'value') -> 内容key为 aB
elm.data('aB'), 没有问题
elm.data('a-b'), 直接取不到, 会将key转换成aB再次读取
```

 Q： 上述读取时，为什么是先使用a-b进行读取，读不到再转成aB读，不能直接转成aB读取吗？
 A: 因为允许这种方式设置：elm.data({ 'a-b': 'hello' })
   而这次方式设置时，目前没有对key进行camel的转化（我估计是对代码没有重构彻底，所以这里做了兼容，后续行为应该会一致）
   PS: 看来jQuery的源码也和我们的代码一样，不是完美的

 所以：我们应该全部使用 camelCase来设置和读取，以做到向后兼容


#### html5 data

读取时如果cache从取不到, 则会尝试从 html5 data属性中取

```js
var config = elm.data('modConfig'); // 取自data-mod-config属性
``` 

读取data属性值，数据转换规则如下

```html
1 "true" -> true
2 "false" -> false
3 "null" -> null
4 $.isNumberic(data) -> parseFloat(..
5 "{...}"或"[...]" -> parseJSON(...
	如果parseJSON失败，则为undefined
6 不转化，即返回源字符串
```

#### 关于data事件

这个特性jQuery文档中并未记录（可能是我没发现），但是这个代码从很早版本开始就有了, 1.4应该就有了，所以用用应该问题不大。

```js
var elm = $('#mydiv1');

elm.bind('getData', function(value, name) {
  console.debug('getData', name, value);
  return 'new data';
});
elm.bind('setData', function(value, name) {
  console.debug('setData', name, value);
});
elm.bind('changeData', function(value, name) {
  console.debug('changeData', name, value);
});

// set
elm.data('myconfig', { url: 'http://www.google.com' });

// get 
var value = elm.data('myconfig');
console.debug(value);
```

可以看到通过绑定getData，我们可以响应data的事件，并且可以拦截取得的数据

当然通过事件：setData 和 changeData, 我们可以在数据设置前/设置后 做一些工作。
感觉这里又有一个地方jQuery没做到位，就是setData应该也像getData一样，能够更改设置的值。

#### 静态和实例方法

jQuery有两个data方法，一个是静态的，一个是实例的， 即 jQuery.data 和 jQuery.fn.data，后者会调用前者进行实际的数据存取工作
我们应用代码中仅使用后者。


### queue

队列，一般用得比较少哦，有一个默认的fx的队列，动画使用的就是这个队列。 这个queue在jQuery中主要是为了动画而创建的。

下面是使用queue的一个例子

```js
$('#button').click(function(e) {
  e.preventDefault();
  
  var elm = $(this);

  elm.delay(3000, 'my');
  elm.queue('my', function(next) {
    alert('反应慢');
    setTimeout(next, 5000);
  });
  elm.queue('my', function() {
    alert('又过了5秒');	
  });

  elm.dequeue('my');
});
```


### promise

返回一个queue的promise接口, 默认是fx

```js
$('#button2').click(function(e) {
  e.preventDefault();	
    
  $('#mydiv').animate({
    width: '500px',
    height: '200px'	
  }).animate({
    'margin-left': '300px'  
  }).animate({
    'margin-top': '300px'  
  }).promise().done(function() {
    $(this).html('complete!');  
  });
});
```


### attr


逻辑参考jQuery.attr


#### 1.  如果属性名称在jQuery.attrFn集合中， 采用相应的方法处理(参看jQuery.attrFn)

有: val, css, html,  text, data, width, height, offset

```js
左边相当于右边
elm.attr('css', ...) -> elm.css(...);
elm.attr('val', ...) -> elm.val(...);

所以如果使用attr设置这些属性，如height, width, 也会得到可以预期的结果
```

当然我们自己使用时，不要依赖这个特性, 应该更明确地直接使用.css, .val等方法


#### 2.  接下来使用"hook模"式对一些特殊属性进行处理

jQuery.attrHooks集合中的属性采用hooks中的方法来处理(参看jQuery.attrHooks)
有 type, value, tabIndex等等

根据浏览器支持的情况，attrHooks集合中的项会有不同，如IE中会对href,src,width,height,style等做特殊处理。 **"这也提供了一种把特殊代码隔离的方法，我们可以用到实践中"**

	
如果是checked disabled readonly selected 等 boolean类型的attribute(参看rboolean)使用 boolHook
否则使用 nodeHook (即处理IE67不能使用getAttribute/setAttribute获取/设置一些属性, 如id/name)


设置属性时， 首先使用hook方法，如果返回空(代码中是undefined)， 则使用 elm.setAttribute方法
获取属性时，首先使用hook方法，如果返回空(代码中是null), 则使用 elem.getAttribute方法


### prop

prop是直接读取/设置节点属性, 而attr使用 get/setAttribute来工作。 如我们使用 select.prop('selectedInde') 或 checkbox.prop('checked') 来获取属性。相当于 select[0].selectedIndex 或 checkbox[0].checked。

处理流程如下：

1\. 使用jquery.propFix来 fix名称
	 
```
class -> className
for -> htmlFor
readonly -> readOnly
```

2\. 如果存在于 jQuery.propHooks中， 则使用相应方法处理
	目前好像只有tabIndex，我们不大走这个分支


3\. 第2步不行，则使用：

```
set：elm[name] = value
get: return elm[name]
```


### attr/prop

`addClass()` `removeClass()` `toggleClass()` `val()` 等方法参数都可以是一个function。


add/removeClass/toggleClass 参数可以是一个function

```js
elms.addClass(function(i) {
  return 'item' + i; 
});
```

toggleClass不仅可以用来切换class状态，还可以

```js
var checked = checkbox.prop('checked'); 
elm.toggleClass('selected', checked);
```

val 可以正确地对 select进行取值/多选也可以(参看valHooks)

```js
sel.val('123'), 会选中option.value相等的那个
sel.val(), 会返回选中的option的值, 如果是多选，会返回一个数组

sel.prop('selectedIndex') 获取选中的index 相当于sel[0].selectedIndex
```



### attrHooks

有父节点的button/input 的type属性是不允许被改的

```js
elm.attr('type', ...) 在jQuery中会抛出一个异常，来防止这种行为
```
