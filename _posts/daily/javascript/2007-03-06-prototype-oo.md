---
layout: post
title: 从 prototype.js 深入学习 javascript 的面向对象特性
categories: javascript
---


js是一门很强大的语言，灵活，方便。 目前我接触到的语言当中，从语法角度上讲，只有 Ruby 比它更爽。  
不过我接触的动态语言只有： js ruby python flash的as 简单的几门， 应该算是井底之蛙之见。  
js 语法成分简单，没有 ruby 语言复杂。所以有时候我觉得她更干净（Ruby Fans 不要攻击我哦，我也是很爱很爱很爱Ruby的）！  
prototype.js 无疑是 js的漂亮之作，从它身上应该可以学到一些东西。  
如果你用 js 在页面仅仅能写出 if, alert等简单的验证代码，或者想多了解一下Js, 那么此文可能对你有帮助。  
好了，开始吧。  
现在我突然想起了 Thinking in java 中的 "一切皆是对像"， 其实我觉得这句话 有点不适合 java 反倒是更适合 js  

### 1.怎样构造(初始化)对象?
 
```js
var Prototype = {   
  Version: '1.5.0_rc1',   
  ScriptFragment: '(?:)((\n|\r|.)*?)(?:<\/script>)',   
  
  emptyFunction: function() {},   
  K: function(x) {return x}   
}   
```

就这样，初始化了一个对象(名字就叫 Prototype)，以及对象的四个成员: Version, ScriptFragment, emptyFunction, K
我们也来试试:
 
```js
var bbs = {   
 name: 'JavaEye',   
 version: '2.0',   
 describe: "做最棒的软件开发交流区",   
 sayHello: function() { alert("hello, i'm javaeye! ") }   
}  
```

于是你可以这样使用： bbs.name 或 bbs.sayHello()
看到吗？ sayHello 是一个方法哦，不要惊慌，"一切都是对象"，所以它和 name 是一样的，只不过初始化，或定义的语法不一样。想起 js 中的正则表达式中的那两个杆杆了吗？ 可爱吧！
方法是对象，所以它可以被当作参数传递，或者作为方法的返回值。
所以 Prototype 中有一个 Version 属性，还有一个匹配 script 的正则式字符串， 一个空方法emptyFunction，还有一个方法 K, 它仅仅返回参数。
没问题吧，继续！

### 2. 构造函数？

先让我们写段代码吧(中学时，我语文极差(大学没语文了)，我想写代码让你们明白我心里真实的想法)：

```js
var Person = function(name) { // 这里 Person 是一个方法   
 this.name = name;   
}   
var bencode = new Persion("bencode");  // 这里像Java吧！   
alert(bencode.name);  
```


先看结果：
从 alert(bencode.name); 可以知道，bencode是对象， 而 name 就是 bencode 的属性， 它被正确地初始化为 "bencode"  
所以 var bencode = new Persion("bencode"); 就是构造了一个新的对象，Person() 相当于构造函数  
所以 new 这个关键字， 就是构造一个新的对象，并且在这个对象上调用相应的方法，并将这个对象返回。  
按上面说： 方法 如果用在 在 new 后面，就相当于成了构造函数了。  
话又说回来了， 如果 var bencode = new Persion("bencode") 是 构造了一个对象，像Java, 那么 Person 是不是类呢？  
可是 Person 不是方法吗？ 可是方法不也是对象吗？ 类也是对象？  
一切皆对象?  
本来无一物！  
好了，看 prototype.js吧  
 
```js
var Class = {   
  create: function() {   
    return function() {   
      this.initialize.apply(this, arguments);   
    }   
  }   
}  
```

初始化一个 Class 对象， 它有一个成员，是一个方法， 这个方法返因另一个方法（方法是对象，所以可以作为参数或者返回值）  
所以如果我们这么做： 

```js
var A = Class.create(); // 此时 A 是一个方法，方法体，下面解释   
var a = new A(...);  // 对方法使用 new 操作符，就是构造一个新的对象，然后在这个对象上调用这个方法( 现在是 A)  
```


上面分析说？ A相当于类， 哈哈 Class.create();  // 终于名副其实  
var a = new A(...);  // 也是相当地直观， 就是构造一个新的对象，类型 是A  
new 操作符构造了对象，并调用了 方法， 这个方法到底做了什么呢？ 也就是上面没有分析的东东，看看先：  

```js
var Class = {   
  create: function() {   
    return function() {  // 见[1]   
      this.initialize.apply(this, arguments);  // 见[2]   
    }   
  }    
}  
```

[1]. new 操作符，就会在新产生的对象上调用这个方法
[2]. 哦？ 这里就是调用 this 对象上的 initialize方法， 并传递 arguments
  换句话说，就是把构造的任务委托给 initialize 方法
  initialize? 哪里来？ 见下面，类的扩展(继承)
  
### 3. prototype?

看段老代码：

 
```js
var Person = function(name) {   
 this.name = name;   
}   
var bencode = new Person("bencode");  
```

bencode应该可以向javaeye介绍一下自己。
像这样：

```js
bencode.sayHello();   
```
 
假如不能实现以上功能的话， 上面的 new，上面所有的东东都等于垃圾。  
所以。需要给 Person 类加"实例方法"  
题外话： 静态方法如何添加？ 看上面的 Class.create, 仅仅是一个对象的成员而已  
好， 再来一段 (为了完整性，上面的几句话，再抄一次)  
 
```js
var Person = function(name) {   
 this.name = name;   
}   
Person.prototype = {  // protype 是啥?   
 sayHello: function() {   
  alert("hi, javaeye, I'm " + this.name);   
 }   
}   
var bencode = new Person("bencode");   
bencode.sayHello();  
```

运行代码，通过！  
prototype是啥？ 请暂时忘记 Prototype(prototype.js) 这个库，名字一样而已！  
让我们再从结果上去分析（第一次我们用这种方法分析而得出了 new 的作用），  
我们在思考：  
 要想 bencode.sayHello() 正常运行  
 bencode 是一个对象, 这是我们已经知道的  
 sayHello() 应该是 bencode 这个对象的方法才可以  
 
 可是bencode 这个对象是 new 操作符产生的, 而 new 此时作用于 Person 这个 "类"  
 那么， 哦？ 那么有两种可能:  
 1. new 产生的那个新对象是不是就是 Person.prototype
 2. Person.prototype 中的成员 将会被 new 操作符添加到 新产生的对象中

再看:
 
```js
Person.prototype = {   
 sayHello: function() {   
  alert("hi, javaeye, I'm " + this.name); // 这里有this   
 }   
}  
```


this.name, 这里的 this 指什么？所以第一个可能讲不通呀  
回忆起这段：
 
```js
var Person = function(name) {   
 this.name = name;   
}  
```

如果这里的 this 代表着新产生的对象的话。  
那么第二种情况就讲得通了， new 将会把 Person.prototype 这个对象的成员放到 这个新对象中。 与当前行为相符。  
所以： Person 的 prototype 对象中的 成员, 将会被添加到 新产生的对象 中(我是这样理解的)  
(不知道 Js解释器是不是开源的， 有空我得去看看，怎么实现的。)  
嘿，默认的 prototype 就是 Object 哦！  

### 4. 扩展？继承？ 

什么是扩展？啥是继承？ ! 我从爸爸那得到了什么？ 
想不通！  
还是实际点：  
有一个类A, 它有一个 sayHello方法  
 
```js
var A = function() {   
}   
  
A.prototype = {   
 sayHello: function() {   
  alert("sayHello A")   
 }   
}   
```

我想构造一个 B 类，让他继承 A 对象， 这句话太抽象。  
其实我们可能想这样：  
 
```js
var b = new B();   
b.sayHello();  // 调用 A 的 sayHello  
```

这应该是继承的第一层含义（重用）  
怎么办到呢？  

```js
var B = function() { // 这里是有一个B类了
}
```

怎么样添加"实例方法"?  快点想起 prototype!!!  
B.prototype = A.prototype  
这样行了吗？ 恭喜, 运行通过！  
让我们整合一次  
 
```js
var A = function() {   
}   
A.prototype = {   
 sayHello: function() {   
  alert("sayHello A");   
 }   
}   
  
var B = function() {   
}   
B.prototype = A.prototype;   
  
var b = new B();   
b.sayHello();    
```


可是如果 B 是这样呢?  
 
```js
var B = function() {   
}   
B.prototype = {   
 sayHi: function() {   
  alert("sayHi B");   
 }   
} 
```


我们是不是应该将 A.prototype 中的内容添加到 B.prototype 对象中，而不是代替它呢？ 当然。  
这样才能"扩展"  
题外话？多态在哪里？ 嘿嘿  
好了，足够多了， 那prototype.js 是怎么样"扩展"的呢？  

```js
Object.extend = function(destination, source) {   
  for (var property in source) {   
    destination[property] = source[property];   
  }   
  return destination;   
}  
```

这个只是简单地把 source 的成员， 添加到 destination 对象中嘛, 哪里看得出扩展？  
如果我这样呢？  
 
```js
var A = function() {   
}   
A.prototype = {   
 sayHello: function() {   
  alert("sayHello A")   
 }   
}   
  
var B = function() {   
}   
Object.extend(B.prototype, A.prototype); // 先添加父类(A)成员   
Object.extend(B.prototype, { // 再添加B类成员, 如果是同名，则覆盖，行为符合 "多态"   
 sayHi: function() {   
  alert("sayHi B");   
 }   
}); 
```

回忆刚才的 Class.create()：
 
```js
var Person = Class.create();   
var bencode = new Person("bencode");  
```

刚才说过， 调用 new 时， 将会创建一个新对象，并且调用 Person 方法， Person 方法会委托给 "新产生对象"的 initialize方法  
怎么样给新产生对象添加 initialize 方法？ 哈哈，轻松  
 
```js
Object.extend(Person.prototype, {   
 initialize: function() {   
  this.name = name;   
 } //,   
 // 下面可以添加其他实例方法。   
});  
```

所以， 我们使用 prototype 创建类一般格式是这样的：
 
```js
var ClassName = Class.create();   
Object.extend(ClassName.prototype, {   
 initialize: function(...) { // 这就相当于构造函数   
 }   
 //...   
});  
```

如果我们要继承一个类，只要：
 
```js
var ClassName = Class.create();   
Object.extend(ClassName.prototype, SuperClassName.prototype);   
Object.extend(ClassName.prototype, {   
 initialize: function(...) {   
 }   
 //...   
});  
```

面向对象部分基本上就这样。  
希望对大家有点帮助!  
本来想再接着写 prototype.js 的源码解读，但一来是因为时间，第二是发现也没有这个必要。  
这种东西是看起来快，写起来慢的。哈哈!  


