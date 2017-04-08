---
layout: post
title: Javascript执行环境和Closure
categories: javascript
---


## 1. 函数作用域


首先是一个例子

```js
function foo() { 
  foo.abc = function() { alert('Alibaba') }
  this.abc = function() { alert('Alimama') }
  abc = function() { alert('Alipay') }
  var abc = function() { alert('Taobao') }
}

foo.prototype.abc = function() { alert('Alisoft') }
foo.abc = function() { alert('Yahoo') }
var obj = new foo();
obj.abc();
foo.abc();   
abc();  
```


如果不是很清楚JS变量的作用域是*函数作用域*， 可能会很晕。
JS的变量是*函数作用域*，而不是*块作用域* 
所以在函数中不管什么位置申明的变量(不包括内部函数，它们有自己的世界)，相当于在函数顶部申明，所以上述代码相当于：


```js
var foo, obj;

foo = function() {... // 先忽视函数体

foo.prototype.abc = function() { alert('Alisoft') }
foo.abc = function() { alert('Yahoo') }
obj = new foo();  
obj.abc(); 
foo.abc();   
abc();  
```

我们先忽略了foo函数体内容, 
如果这样的话 obj.abc() 应该调用的是  prototype.abc = function... 即： Alisoft
foo.abc() 调用的就是上述的 foo.abc = function... 即 Yahoo

可是在net foo() 这一步中, 先前被我们暂时忽略的foo函数进行了偷天换日。。

再看foo的函数体, 同样将var申明提前:

```js
function foo() { 
  var abc;
  
  foo.abc = function() { alert('Alibaba') }
  this.abc = function() { alert('Alimama') }
  abc = function() { alert('Alipay') }
  abc = function() { alert('Taobao') }
}
```


上述代码很明了, foo.abc 现在是 Alibaba, 而 this.abc 现在是 Alimama, 
abc 只是函数 foo的局部变量， 在全局作用域中并不存在。

所以最后输出的结果是 1. alert('Alimama'); 2. alert('Alibaba'); 3. 报错(abc is not defined)

理解变量作用域非常重要, 否则很多东西解释不了。 

变量作用域有两种
1. *块作用域*, 即从变量申明点起到块结束为止(右括号等), 如: C, C++, JAVA, 
2. *函数作用域*， 如: JS, PHP等


再看一个例子：

```js
a = 'hello';
if (true) {
  var a = 'world';
  alert(a);
}
alert(a);
```


上述代码相当于

```js
var a;
a = 'hello';
if (true) {
  a = 'world';
  alert(a);
}
alert(a);
```

现在很清晰了!

但如果上面的是java代码, 像这样:

```js
String a = "hello";
if (true) {
  String a = "world";
  println(a);
}
println(a);
```

会是不一样的结果, if 区块内是另外一个作用域, 不会影响到外面的a

再看一个我们可能会犯的错误：

```js
var buttons = document.getElementsByTagName('input');

for (var i = 0; i < buttons.length; i++) {
  buttons[i].onclick = function() {
    alert(i);
  };
}
```

上述代码本意是想按每个按扭, 输出他们的序号, 但得不到想要的结果, 因为上述代码实现上像这样:

```js
var buttons, i;

buttons = document.getElementsByTagName('input');

for (i = 0; i < buttons.length; i++) {
  buttons[i].onclick = function() {
    alert(i);
  };
}
```

即只有一个i, for循环后, i就是 buttons.length - 1;

那怎么办呢? 可以创建一层作用域:

```js
var buttons = document.getElementsByTagName('input'),
  i;

function handleClick(button, index) {
  button.onclick = function() {
    alert(index);
  };
}
  
for (i = 0; i < buttons.length; i++) {
  handleClick(buttons[i], i);
}
```

上面是关于JS变量作用域的一些东西，正因为Js是函数作用域, 所以有些大牛(Douglas等)建议变量都在函数开始处进行申明, 并且一个函数只有一个var, 
Jslint也有这样的选项(Allow one var statement per function)用来检查是否符合这样的规范。

关于变量作用域, 还有最后一个问题:

```js
function a() {
}

a = function() {
};
```

以上两种定义函数的方式有啥区别?

看一个例子：

```js
function a() {
  var b;
  
  return b;
  
  function b() {
    alert('b');
  }
}

a()();


function c() {
  var d;
  return d;
  
  d = function() {
    alert('d');
  };
}

c()();
```

结果: alert('b') 然后报错, c() is not a function

```js
var d = function()..., 这是语句
function b() {...   这是申明
```

JS引擎在执行上述代码前, 会先准备环境(Context), 后执行语句
在准备环境时, 会先"申明"所有变量, 这样在准备阶段过后, b函数(对象)就已存在
而上述 d = function... 是语句, 它没有被执行到就被return了。



## 2. Closure

关于执行环境第二个重要部分就是Closure, 这里先提一下。

在JS中，可以定义内部函数，因为函数也是对象，函数体中可以创建其他对象，当然也能创建函数对象，所以这是必须的. 
Closure讲的就是内部函数可以访问外围函数作用域内的变量，为了让函数成为一等公民(真正的对象)，Closure机制也是必须的。
所以JS中的函数不是孤立的一个函数，函数是一个对象，它会与一个环境(产生这个函数的环境--静态作用域)进行绑定，形成一个整体
同时在执行时，会有一个对象(this)与它绑定(动态作用域, 访问时需要this前缀)

所以函数大概像下面这样

> 迁移过来的，缺一张图

讲到函数的closure时，我们应该想到它的静态模型，即函数对象还包括一个JS不能访问的一个sope属性。

如果是这样, 那么内部函数不管有无使用外部作用域变量，都会形成Closure, 而事实确实是这样的。

```js
window.onload = function() {
  $('button1').onclick = button1Click;
};

function button1Click() {
  var a = []; // a是一个大数组(32位下需要占400M)
  var size = 100 * 1000 * 1000;
  for (var i = 0; i < size; i++) {
    a[i] = i;
  }
  
  $('button2').onclick = function() {
  };
}

function $(id) {
  return document.getElementById(id);
}
```

虽然button2的onclick函数中并没有使用任何外围环境中的变量, 但button2.onclick函数创建后确实也会引用一个scope链, 这里面包含a的引用，即形成了Closure

比较现代的浏览器会检测到button2.onclick中并没有使用a， 所以会释放a占用的内存， 但IE等古老浏览器将不会对a进行释放, 因为确实形成了closure.
而我们事件绑定的代码非常普遍, 所以要注意函数内大的数据结构的使用。


## 3. this

```js
function printThis() {
  console.debug(this);
  console.debug(this.abc);
  console.debug('-----------------');
}

printThis();

var o1 = { abc: 123, printThis: printThis };
o1.printThis();

var o2 = { abc: 234 };
printThis.apply(o2);

var o3 = new printThis();
console.debug(o3);
```

以上代码比较简单，不作解释， 但关于new 表达式有几点说明。

当使用new时，将会创建一个新对象(Object), 绑定到函数运行时的context上(可以参看closure部分的那个图)， 所以函数体内的this将指向这个对象。
当函数没有返回值时, new表达式将返回这个新对象
当函数返回一个*引用对象*时, new表达式将返回这个引用对象
当函数返回其他(数值, 字符串, boolean等值对象), new表达式返回创建的新对象

以下例子，用于说明以上情况：

```js
function A() {
  this.abc = 'abc';
}
var a = new A();
console.debug('A', a, a.abc);   // A Object { abc="abc"} abc


function B() {
  this.abc = 'abc';
  return 'B';
}
var b = new B();
console.debug('B', b, b.abc);   // B Object { abc="abc"} abc


function C() {
  this.abc = 'abc';
  return new String('C');
}
var c = new C();
console.debug('C', c, c.abc);   // C C { 0="C"} undefined


function D() {
  this.abc = 'abc';
  return {};
}
var d = new D();
console.debug('D', d, d.abc);   // D Object {} undefined

function E() {
  this.abc = 'abc';
  return new Object();
}
var e = new E();
console.debug('E', e, e.abc);   // E Object {} undefined


function F() {
  this.abc = 'abc';
  return 123;         
}
var f = new F();
console.debug('F', f, f.abc);   // F Object { abc="abc"} abc


function G() {
  this.abc = 'abc';
  return new Number(123);   
}
var g = new G();
console.debug('G', g, g.abc);   // G 123 {} undefined


function H() {
  this.abc = 'abc';
  return true;   
}
var h = new H();
console.debug('H', h, h.abc);   // H Object { abc="abc"} abc


function I() {
  this.abc = 'abc';
  return new Boolean(true);
}
var i = new I();
console.debug('I', i, i.abc);   // I true {} undefined


function J() {
  this.abc = 'abc';
  return /\d+/;
}
var j = new J();
console.debug('J', j, j.abc);   // J /\d+/ undefined


function K() {
  this.abc = 'abc';
  return new RegExp('\\d+');
}
var k = new K();
console.debug('K', k, k.abc);   // K /\d+/ undefined

```

总结起来就是: 数值，字符串，true/fase 等*值对象*作为返回值时, new 表达式将忽略, 而返回创建的那个对象，
如果返回这些值*包装对象(引用对象)*, 那么将采用这些引用对象作为new表达式的返回值


## 4. prototype

prototype链和对象的属性查找有关系, 可以使用这个机制实现面向对象的继承特性。当然继承在js等动态语言中还可以通过mixin来完成。

还是一个例子：

```js
var A = function() {};
A.prototype = { propPA: 'PA' };

var a = new A();
a.propA = 'A';


var B = function() {};
B.prototype = a;

var b = new B();
b.propB = 'B';


var C = function() {};
C.prototype = b;


var c = new C();
c.propC = 'C';


console.debug(c.propC);   // C
console.debug(c.propB);   // B
console.debug(c.propA);   // A
console.debug(c.propPA);  // PA
console.debug(c.toString());  // [object Object]
```


这个机制非常精秒和强大，给一副图（也是js引擎内部属性的对象模型）

> 缺图

有几点说明, 
1. 一个function 默认的prototype 就是一个Object, 而不是null
2. 取属性时走prototype链
3. 设置属性时不走prototype链



## 5. 全部整合起来

上面讲了*函数作用域, closure, this， 以及原型链prototype*, 知识点比较松散, 那JS引擎是如何实现这些机制的呢？里面的世界到底是怎么样的?

再举个较复杂的例子，然后用文字和图表试着描述它。

```js

var num = 123;
var str = 'hello world';
  
var fun = function() {
  var num2 = 234;
  var str2 = 'alibaba';
  num = 578;
  
  function show(text) {
    alert(text);
  }
  
  show('hi');
  
  return function() {
    show('hello');
    
    str = 'google';
    str2 = 'alimama';
    str3 = 'yahoo';
    
    var str4 = 'alisoft';
    
    alert(this.title);
  };
};

var inner = fun();

inner();

var o = { title: 'another world', run: inner };
o.run();

```

这个例子稍微有点比较复杂，让我们模拟虚拟机走一遍

1. 首先, 所有的代码都在一个执行环境(context)中被执行， 全局代码在全局环境中被执行。
我们为了概念上的统一性，可以假设全局代码是在一个main入口函数中, 这样所有代码都在函数中了。

2. 在第二部分Closure介绍过，函数对象包含一个js代码不能访问的scope引用。

3. 代码在执行前，会先准备执行环境


在所有代码执行前，差不多是这样：

> 缺图

即有一个main函数对象，函数对象会有一个scope属性，这个属性在js中不能访问， 但是scope里面的属性我们在JS是可以访问的。

接着为了执行main 函数，js引擎会先创建执行环境
我们在全局中共申明了5个变量： var num, str, fun, inner, o, 在这一步得到体现。

> 缺图

1. context即函数的执行环境， 它是一个栈链，当函数执行完毕后，将被销毁。

2. 在这一步还创建了一个非常重要的对象Scope, 它挂接到context所属function 的 scop 链上。
  scope的属性，即我们申明的变量， 注意，都是undefined，(如果是函数申明，将会创建一个函数对象，下面会看到)。

3. context还引用一个对象，就是this, 函数体中的this前缀的引用，都会到这个对象中找。这也解释了为什么函数中的this是动态的，因为不同的context有不同的this。

4. 这一步我们看到了JS为什么是*函数作用域*，因为你不管在函数的哪个位置申明变量（内部函数不算），都会被放到Scope对象中，而这一切是在执行语句之前进行的。


准备好环境后，下面就是执行了：

```js
num = 123;
str = 'hello world';
fun = function() {...// 函数没执行，JS引擎在正常情况下是不去管函数体的, 所以仅仅是创建了个函数对象。

//-------下面将执行fun函数， 到这里为止是怎么样的呢？
// inner = fun(); 
```

> 缺图

在这一步num, str, fun都被创建

还了解到一个东西：

1. 函数的scope链和它所在的context的scope链相同

2. 这也能解释为何在函数执行完毕后，context销毁后，内部函数还能访问外围作用域变量，因为函数对象还引用这个Scope链，它不会随context的销毁而释放。

3. 所以我们所说的closure理解上应该是：一个函数对象，再加上一条尾巴（Scope链）


为了执行 fun方法，同样也要准备context环境

> 缺图

同样创建好了scope2对象，并有属性 num2，str2，show

注意到show是一个函数申明语句，所以在context准备阶段即会创建这个对象。
所以在函数体内，如果return在函数申明之前，函数对象也会被创建，
也能解释为何使用函数的语句在函数申明的语句之前也不会有问题。

这里注意的一个点是： context之间形成栈链，这个在图中没有体现出来，内层context执行完毕将销毁，然后控制权将转移到外层（上层）context。

下面就是执行fun方法：

```js
num2 = 234;
str2 = 'alibaba';
num = 578;

show('hi');
  
return function() ...;
```

上面是还没有退出context fun前的状态，

有两点：

1. 外围num被重新赋值, 这通过scope链轻易办到
2. 创建了一个临时函数对象，这个函数即将返回。
3. context fun 也将销毁

然后是: 

```js
var inner = fun(); 执行完毕
```

可以看到

1. context fun已销毁，但scop2对象还存在，因为存在inner对它的引用。
2. 当前执行环境回到context main中

下面是

```js
inner();
```

这比较简单，可以自己推敲， 忽略。

下面是：

```js
o = \{ title: 'another world', run: inner \};
o.run();
```

run就是inner, 同样创建执行环境，只是此时this指向 o, 像下面这样：


其他都和刚才一样，有两点提一下：

1. str3会引用scope链中的属性，但并不存在，这会在scope main中创建一个属性 str3
2. 由于此时context引用的this对象是o, 所以函数内this.title = o.title, 为 'another world';

*最后的补充*

上述没有涉及到函数参数，arguments等东东，实际上在准备context过程中， 在创建scope对象的时候，会把这些东西也加到scope对象中的。
总的顺序是这样的：

1. 创建arguemnts对象
2. 函数的形式参数首先被添加到scope对象中3
3. 内部函数申明
4. 局部变量


我们可以感受到整个JS引擎执行环境是非常精简和精秒的，再加上prototype链的属性查找机制，使得JS成为一门非常动态简洁强大而优美的语言。

总的来说, js是我第2喜欢的动态语言。

参考：

1. Javascripts Closures: http://jibbering.com/faq/notes/closures/
2. ECMA-262-3 第10节： Executeable Code and Execution Contexts




