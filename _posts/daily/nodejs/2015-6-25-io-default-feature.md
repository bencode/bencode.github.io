---
layout: post
title: iojs中的默认es6特性
categories: nodejs
---
记录iojs中可以默认使用的es6新特性


## let 块作用域

[link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)


## const 常量定义

[link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)


## class 类定义

[link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)


### declarations  申明式

```js
class Polygon {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}
```

### expression  表达式

```js
// unnamed
var Polygon = class {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
};

// named
var Polygon = class Polygon {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
};
```

### prototype method  实例方法

```js
class Polygon {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
  
  get area() {
    return this.calcArea()
  }

  calcArea() {
    return this.height * this.width;
  }
}
```

### static method  静态方法

```js
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        return Math.sqrt(dx*dx + dy*dy);
    }
}

const p1 = new Point(5, 5);
const p2 = new Point(10, 10);

console.log(Point.distance(p1, p2));
```


### extends  继承

```js
class Animal { 
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(this.name + ' makes a noise.');
  }
}

class Dog extends Animal {
  speak() {
    console.log(this.name + ' barks.');
  }
}
```

### super  调用父类方法

```js
class Cat { 
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(this.name + ' makes a noise.');
  }
}

class Lion extends Cat {
  speak() {
    super.speak();
    console.log(this.name + ' roars.');
  }
}
```

## Collections  集合


### Map & WeakMap

[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
[WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)


### Set & WeakSet

[Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
[WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)


## Generator  生成器

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*


## Binary and Octal literals 二进制和八进制

```js
var FLT_SIGNBIT  = 0b10000000000000000000000000000000; // 2147483648
var FLT_EXPONENT = 0b01111111100000000000000000000000; // 2139095040
var FLT_MANTISSA = 0B00000000011111111111111111111111; // 8388607
```

```js
var n = 0O755; // 493
var m = 0o644; // 420

// Also possible with leading zeros (see note about decimals above)
0755
0644
```


## Object literal extensions (shorthand properties and methods)

```js
var obj = {
  // __proto__
  __proto__: theProtoObj,
  // Shorthand for ‘handler: handler’
  handler,
  // Methods
  toString() {
    // Super calls
    return "d " + super.toString();
  },
  // Computed (dynamic) property names
  [ 'prop_' + (() => 42)() ]: 42
};
```


## Promise

[link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)


## Symbols

[link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)


## Template String

[link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings)
