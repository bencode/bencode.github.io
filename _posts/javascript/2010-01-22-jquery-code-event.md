---
layout: post
title:  jQuery源码解析3(Event) 
categories: javascript
---


这一篇，我们要看 jQuery Events 部分的源码。
 
这一次看的是1.4的源码，因为API接口没变，但功能增强，并且live支持了所有事件, 支持context等。
 
我们平常这样写：
 
```js
$('#button').click(function() {  
  alert('you hurt me!');  
});  
```
 
也可以这样写：
 
```js
$('#button').bind('click', function() {  
  alert("don't touch me!");  
});  
```
 
想到click的实现应该基于bind, 搜索一下bind, 来到这里：
 
```js
jQuery.each(["bind", "one"], function( i, name ) {  
  jQuery.fn[ name ] = function( type, data, fn ) {  
    // Handle object literals  
```
 
看来bind 和 one 有点关系呀！它们的签名都是这样：

```js
function(type, data, fn);
```
 
one 是啥？
 
```js
$('#button').one('click', function() {  
  alert('下次点我就不会有效果了!');  
});  
```
 
没问题，我们go on
 
```js
if ( typeof type === "object" ) {  
  for ( var key in type ) {  
    this[ name ](key, data, type[key], fn);  
  }  
  return this;  
}  
```
 
在1.4中，我们可以一次绑定多个事件：
 
```js
$('#div').bind({  
  click: function() {  
  },  
  mouseenter: function() {  
  }   
});  
```

 
接着往下看：
 
```js
if ( jQuery.isFunction( data ) ) {  
  thisObject = fn;  // thisObject 哪里来的？  
  fn = data;  
  data = undefined;  
}  
```
 
bind 和 one 的 签名是 function(type, [data], fn),  这个 if 让我们可以省略 data。
此外 thisObject = fn;  thisObject 哪里来的？ 
 
我的感觉是作者可能想让 bind 中的事件能够绑定特定的scope。
如： （注，这段功能我是假想）

```js
$('#button').bind('click', function() {
  this.name;  // 现在的this不是 button
}, { name: 123 });
```

但现在并没有实现，而且也不需要实现，因为有jQuery.proxy 帮助我们完成需要的事。
 如果实现，函数签名应该是：  `function( type, data, fn, thisObject);`
 
继续：
 
```js
var handler = name === "one" ? jQuery.proxy( fn, function( event ) {  
      jQuery( this ).unbind( event, handler );  
      return fn.apply( this, arguments );  
    }) : fn;  
```
 
这段代码对one进行特别处理， 创建一个新的代理事件方法，让其执行后进行解绑，以达到one的效果。
 
jQuery.proxy 是 1.4 中新添加的方法, 它可以生成一个代理function, 用于改变fn的scope。
 
```js
proxy: function( fn, proxy, thisObject ) {  
  if ( arguments.length === 2 ) {  
    if ( typeof proxy === "string" ) {  
      thisObject = fn;  
      fn = thisObject[ proxy ];  
      proxy = undefined;  
    } else if ( proxy && !jQuery.isFunction( proxy ) ) {  
      thisObject = proxy;  
      proxy = undefined;  
    }  
  }  
  
  if ( !proxy && fn ) {  
    proxy = function() {  
      return fn.apply( thisObject || this, arguments );  
    };  
  }  
  
  if ( fn ) {  
    proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;  
  }  
  return proxy;  
},  
```
 
公开的API使用两个参数的版本：
 
```js 
var user = {  
  name: "bena",  
  say: function() {  
    alert( this.name );  
   }  
};  
```
  
```js
$("#button").click(jQuery.proxy(user, 'say'));  
  
$("#button").click(jQuery.proxy(user.say, user));  
```
 
 
但在这里没有"正规使用"， 仅仅为它们设置了一个guid。
 
写得白一点就是：
 
```js
var handler  = fn;  
if (name === 'one') {  
  handler = function(event) {  
    jQuery(this).unbind(event, handler);  
    return fn.apply(this, arguments);  
  };  
  handler.guid = fn.guid = ...;  
}  
```
 
完成了这个之后，接着就要把任务交给 jQuery.event.add 啦
 
```js
return type === "unload" && name !== "one" ?  
  this.one( type, data, fn, thisObject ) :  
  this.each(function() {  
    jQuery.event.add( this, type, handler, data );  
  });  
```

当 type == 'unload' 时： this.one(type, data, fn, thisObject);  // 看，这里是调用四个参数的，和我们上面的猜想一致(可能在下一版本中实现)
 
下面我们就要来看看重要的：
 
### jQuery.event.add(elem, type, handler, data); 
 
```js 
jQuery.event = {  
  add: function( elem, types, handler, data ) {  
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) {  
      return;  
    }  
  
    // For whatever reason, IE has trouble passing the window object  
    // around, causing it to be cloned in the process  
    if ( elem.setInterval && ( elem !== window && !elem.frameElement ) ) {  
      elem = window;  
    }  
  
    if ( !handler.guid ) {  
      handler.guid = jQuery.guid++;  
    }  
```
 
 
nodeType == 3 表示文本text， nodeType  == 8 表示注释， 这两个不需要事件， 所以略过。
 
如果是window 对象， 对IE进行特别的处理（IE真是怪呀）
 
 
接着往下看：
 
```js
if ( data !== undefined ) {  
  // Create temporary function pointer to original handler  
  var fn = handler;  
  
  // Create unique handler function, wrapped around original handler  
  handler = jQuery.proxy( fn );  
  
  // Store data in unique handler  
  handler.data = data;  
}  
```
 
如果有data, 会创建一个原事件方法的代理，然后设置data。因为我们可能会挂接一个handler到多个事件
 
 
继续：
 

```js 
var events = jQuery.data( elem, "events" ) || jQuery.data( elem, "events", {} ),  
  handle = jQuery.data( elem, "handle" ), eventHandle;  
  
if ( !handle ) {  
  eventHandle = function() {  
    return typeof jQuery !== "undefined" && !jQuery.event.triggered ?  
      jQuery.event.handle.apply( eventHandle.elem, arguments ) :  
      undefined;  
  };  
  
  handle = jQuery.data( elem, "handle", eventHandle );  
}  
  
if ( !handle ) {  
  return;  
}  
  
// Add elem as a property of the handle function  
// This is to prevent a memory leak with non-native  
// event in IE.  
handle.elem = elem;  
```
 
这一段创建（获取）节点相关联的两个对象: events 和 handle (节点上有多个事件，则公用)
 
events 是一个普通对象。
handle 是一个函数， 函数体等用到的时候再看。

因为不是任何节点都能 jQuery.data,像(embed, object, applet) 所以上面有一个 if (!handle) 判断。
 
```js
types = types.split( /\s+/ );  
var type, i=0;  
while ( (type = types[ i++ ]) ) {  
  // Namespaced event handlers  
  var namespaces = type.split(".");  
  type = namespaces.shift();  
  handler.type = namespaces.slice(0).sort().join(".");  
```
 
我们可以这样使用：
 
```js
$('#button').bind('click mouseenter', function() {}); // 同时绑定多个事件。
```
 
自1.3以后，jQuery也支持namespace event。
 
可以这样调用：

```js 
$('#button').bind('click.abc.def', function() {});
```
 
此时 type = 'click',  handler.type = 'abc.def'
 
再往下看：
 

```js 
var handlers = events[ type ],  
  special = this.special[ type ] || {};  
  
if ( !handlers ) {  
  handlers = events[ type ] = {};  
  
  if ( !special.setup || special.setup.call( elem, data, namespaces, handler) === false ) {  
    if ( elem.addEventListener ) {  
      elem.addEventListener( type, handle, false );  
    } else if ( elem.attachEvent ) {  
      elem.attachEvent( "on" + type, handle );  
    }  
  }  
}  
```
 
先不管 handlers = events[type] 是啥， 反正一开始肯定是空的：）
我们的type也不special。
 
代码终于到了这里：
 
```js
if ( elem.addEventListener ) { // DOM  
  elem.addEventListener( type, handle, false );  
} else if ( elem.attachEvent ) { // IE  
  elem.attachEvent( "on" + type, handle );  
}  
```
 
我们看到， 事件终于在这里挂接，并且一个节点相同type的事件只挂接一次。
 
而事件触发时，将会调用 handle （就是这个上面被我们暂时忽略的方法，现在要仔细看）：
 
```js
if ( !handle ) {  
  eventHandle = function() {  
    return typeof jQuery !== "undefined" && !jQuery.event.triggered ?  
      jQuery.event.handle.apply( eventHandle.elem, arguments ) :  
      undefined;  
  };  
  
  handle = jQuery.data( elem, "handle", eventHandle );  
}  
if ( !handle ) {  
  return;  
}  
  
// Add elem as a property of the handle function  
// This is to prevent a memory leak with non-native  
// event in IE.  
handle.elem = elem;  
```
 
在页面unload后，jQuery 对象不存在了。jQuery.event.triggered 我们暂时也不用管。

```js
handle 仅仅把操作代理给
handle = function() {
  jQuery.event.handle.apply(elem, arguments) :
};
```
 
 
### 2. jQuery.event.handle(event)
 
这里的event是浏览器相关的， 此函数的scope（即this), 是 elem。
 
```js
handle: function( event ) {  
  var all, handlers;  
  
  event = arguments[0] = jQuery.event.fix( event || window.event );  
  event.currentTarget = this;  
```
 
首先将 event 包装成 jQuery.Event 对象， 让其在所有浏览器上都有相同的属性和行为。
 
然后根据 type从节点找到 handlers，准备执行：
 
```js
var namespaces = event.type.split(".");  
event.type = namespaces.shift();  
  
all = !namespaces.length && !event.exclusive;  
  
var namespace = new RegExp("(^|\\.)" + namespaces.slice(0).sort().join("\\.(?:.*\\.)?") + "(\\.|$)");  
  
handlers = ( jQuery.data(this, "events") || {} )[ event.type ];  
```
 
由浏览器触发的事件 type 不会包含namespace。
用户调用trigger时，可以包含namespace,  到时候再来看。 
 
下面就是执行handers了:
 
```js 
for ( var j in handlers ) {  
  var handler = handlers[ j ];  
  if ( all || namespace.test(handler.type) ) {  
    event.handler = handler;  
    event.data = handler.data;  
  
    var ret = handler.apply( this, arguments );  
  
    if ( ret !== undefined ) {  
      event.result = ret;  
      if ( ret === false ) {  
        event.preventDefault();  
        event.stopPropagation();  
      }  
    }  
  
    if ( event.isImmediatePropagationStopped() ) {  
      break;  
    }  
  
  }  
}  
  
return event.result;  
```
 
 可以看到
event.data = handler.data。
 
事件方法返回 false 相当于：
event.preventDefault();
event.stopPropagation();
 
