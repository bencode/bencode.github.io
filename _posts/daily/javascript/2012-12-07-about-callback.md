---
layout: post
title: Javascript中的回调
categories: javascript
---

## 背景

由于前端的交互特性，有非常多的地方要用回调，特别是UI类组件

如我们的对话框

```js
Dialog.confirm('确定删除吗？', {
  icon: 'warn',
  confirm: function(dialog) {
    deleteItem();
    dialog.close(); 
  }
});

console.debug('马上就到这了');
```

上述对话框打开时会一直开着，只到你点击"确定"或"取消"
console.debug不会等待对话框关闭，它马上就会执行
这种类似于异步的行为在前端中到处可见，它一般是由事件的回调来实现的

这次主要想分享一下回调函数使用注意的情况和模式

## 注意

要注意回调函数的调用方法

```js
var View = new Class({
  
  init: function() {
    Dialog.confirm('...', {
      confirm: this.doDelete  
    });
  }，

  doDelete: function() {
    var div = this.div; // 这个this是什么?
  }
  
});
```

上述是新手使用面向对象方式编写时最易犯的错误
要深刻理解js中的this指向的是什么

js中的this和如何调用这个方法有关系

```js
var f = function() {
  console.debug(this.name);
};

f();  // 此时f在global context对象上调用，在浏览器中就是window, 所以this.name就是window.name


var o = { f: f, name: 'hello' };
o.f();  // 此时f在o对像上调用，所以就是o.name

var b = { name: 'my hello' };
f.call(b) // 此时f被指定在b对象上调用， 所以此时this.name就是b.name
```

所以上述 

```js
Dialog.confirm('...', { 
  confirm: this.doDelete  
})
```

doDelete里面的this.div中的this是由如何调用 doDelete来决定的，而doDelete这个作为回调被Dialog内部调用

而在Dialog内部一般是这样调用的

```js
$('a.confirm').on('click', function() {
  ...
  options.confirm();  // 此时confirm方法内的this就是otpions对象

  或者
  var confirm = options.confirm;
  confirm();    // 此时confirm方法内的this就是window
});
```

所以回调函数内的this如果没有文档特别说明，是未定义的
这就表示我们在回调中，不能像上面这样使用，应该这样


```js
var View = new Class({
  
  init: function() {
    var self = this;      // 这个this就是当前实例对象

    Dialog.confirm('...', {   // <---- 这个是options临时对象
      confirm: function() { // <---- 所以这个confirm里使用的this可能是临时对象 也可能是window也可能是其它，由Dialog如何回调决定
        self.doDelete();  //  doDelete里面的this 就是self, 也就是当前实例对象
      }
    });
  }，

  doDelete: function() {
    var div = this.div; 
  }
  
});
```

var view = new View();    
这样做的结果是构造一个新的对象，最后让 init方法中的this指向这个实例对象
关于Class的实现下次再分享

*注意回调方法的使用，总是让方法内部的this指向当前对象*

你可以简写

```js
var View = new Class({
  init: function() {
    var self = this;
    Dialog.confirm('...', {
      confirm: $.proxy(this, 'doDelete');
    });
  }
});
```

$.proxy是一个包装方法，这个方法在上面的应用中相当于

```js
var proxy = function(object, name) {
  return function() {
    object[name].apply(object, arguments);
  };
};
```

可以看到这个proxy返回一个新的function，
一个方法返回另一个方法，这在函数式编程里被称为 “高阶函数”

proxy主要用来产生一个新的函数，有时候我们还需要绑定一些额外的参数

```js
var A = {
  init: function() {
    var self = this,
      elm = $('...');

    $.ajax(.. {
      success: function(o) {
        self.doSuccess(elm, o);
      }
    });
  },

  doSuccess: function(elm, o) {
  }
}
```

可以看到以上success里面调用doSuccess传递两个参数
我们可以用proxy改写为


```js
var A = {
  init: function() {
    var elm = ...
    $.ajax(..., {
      success: $.proxy(this, 'doSuccess', elm); // 传递了elm参数
    });
  },
  doSuccess: function(elm, o) {
    ...
  }
}
```

即proxy可以产生一个“偏函数”

给个例子

```js
var fn = function(a, b, c) {
  return a + b + c;
};
fn(1, 2, 3);  // 带三个参数

var pfn = jQuery.proxy(fn, null, 1, 2); // 产生一个fun的偏函数先绑定两个参数
pfn(3);
```


打住, 关于JS函数式编程的更多东西以后再分享，
我打算做一系列短分享，用来让大家了解JS和我们的旺铺前端，每个小分享控制在200行内
这样我轻松，大家也轻松

