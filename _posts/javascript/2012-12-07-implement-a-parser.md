---
layout: post
title: 一个Parser的实现
categories: javascript
---


## 背景
在我们的设计师平台，设计师可以在编辑器中输入 HTML, CSS 等代码， 而前端需要对其有效性进行验证，用正则表达式能很好地对词汇进行效验，却难以在语法层面上发挥作用，所以需要实现简单的Parser将HTML,CSS转换成相应的结构进行效验。
 
## 原理

HTML语法和CSS语法非常简单，所以只要用一点的文法知识就可以Parser了，这里采用的是LL(1)，我们直接开始

## 几个帮助方法

我们首先要实现3个帮助方法

1. check  判断当前位置是否匹配指定样式 
2. skip   略过指定样式字符串
3. until  parser直到指定样式，即返回当前位置到指定样式之间的字符串


```javascript
var Mixin = {

  /**
   * 判断当前位置是否匹配指定样式
   * @param {string} pattern
   *
   * @return {boolean}
   */
  _check: function(pattern) {
    var o = Helper.match(this.body, '\\s*' + pattern, this.pos);
    return o ? o.pos === this.pos : false;
  },

  /**
   * 略过指定样式字符串
   * @param {string} pattern
   */
  _skip: function(pattern) {
    var o = Helper.match(this.body, '\\s*' + pattern, this.pos);
    if (o && o.pos === this.pos) {
      this.pos += o.text.length;
    } else {
      this._error('skip fail: ' + pattern);
    }
  },

  /**
   * parse到指定样式
   * @param {string} pattern
   * @param {boolean} 不对结果进行trim, 
   *    默认会对parse的结果进行trim
   *
   * @return {string}
   */
  _until: function(pattern, notrim) {
    var o = Helper.match(this.body, pattern, this.pos);
    if (!o) {
      this._error('parse until fail: ' + pattern);
      return;
    }

    var last = this.pos,
      value = this.body.substring(last, o.pos);

    this.pos = o.pos;
    return notrim ? value : $.trim(value);
  },

  _error: function(msg) {
    throw new Error(msg);
  }
};
//~ Mixin
```

上面的几个方法实现非常直接，不过可能有人会问两个问题：

1. Helper.match 是什么，在哪实现
2. this.body, this.pos是什么？为什么这几个方法在 包装在一个叫Mixin的对象内


## Helper.match

Helper.match用来从指定位置开始， 匹配指定pattern
这应该是正则表达式的功能，只是Javascript中的正则式功能比较简单，不能直接完成这个功能，需要包装一下

```javascript
var Helper = {
  /**
   * 在body中匹配pattern, 从from位置开始
   * @param {string} body
   * @param {string} pattern
   * @from {number} from 从这个位置开始匹配
   *
   * @return {object}
   *  - text 匹配的字符串
   *  - pos  匹配的位置
   */
  match: function(body, pattern, from) {
    var re = this._regexps[pattern];
    if (!re) {
      re = this._regexps[pattern] = 
          new RegExp(pattern, 'g');
    }
    re.lastIndex = from;

    var match = re.exec(body);
    return match ? {
      text: match[0],
      pos: re.lastIndex >= from ? 
        re.lastIndex - match[0].length: 
        body.length - match[0].length
    } : false;
  },
  
  _regexps: {}  
};
```

上面我们还做了一个小小的cache :)


## Mixin 

这一小节和Parser无关，和API的设计有点关系

我们需要实现两个Parser: HtmlParser和CssParser
正规方式是包装上面几个方法成 BaseParser, 然后让HtmlParser和CssParser继承它，再实现自己的逻辑

然后使用时大概像这样

```javascript
var parser = new HtmlParser(body),
try {
  var result = parser.parse(),
    pos = parser.pos;
} catch (e) {
  // parser出错
}
```

我们看到每次Parser一个字符串时，都需要创建一个Parser实例，都需要以上一小段代码(没帖全，比上面的要长一点)
所以最好希望把它封装成一个“静态方法”，可以像这样使用:

```javascript
var o = HtmlParser.parse(body);
if (o.success) { // 是否成功
  // o.result 结果
} else {
  // o.message 出错信息
  // o.pos 出错位置
}
```

要是有“静态继承”就好了，即能继承实例方法，又能继承静态方法。 
由于javascript的动态性，可以很方便实现以上特性

我们的目标是这样

```javascript
var HtmlParser = ...

ParserModule.mixin(HtmlParser);  // 将以上的帮助方法和parser静态方法“混”到HtmlParser中
```

题外话：
  我相信 mixin 两边对象的顺序好像弄反了，上面语句我要表达的是： 将 ParserModule中的一些方法混到HtmlParser中去
  而上面语句直观上表达的好像刚好相反，叫mixinTo? 好像没见过这词，哈哈，不管了。。


看mixin的实现（可直接略过define部分，直接到 return 这里）

```javascript
define('util.ParserModule', .. function() {

var Helper = {
  match: function() ...
};
var Mixin = {
  // 刚才的几个帮助方法
};


// 我们的ParserModule的内容
return {
  mixin: function(klass) {
    $.extendIf(klass.prototype, Mixin);     // 将Mixin混到目标的prototype中，就相当于java中的继承
    klass.parse = klass.parse ||        // 在目标上创建parse方法
        $.proxy(this, '_parse', klass);
    return klass;
  },

  _parse: function(klass, body) {         // 我们提供的parse方法
    var parser = new klass(body),
      start = $.now(),
      success = false,
      result = null,
      message = null;

    try {
      result = parser.parse();
      success = true;
    } catch (e) {
      message = parser.message;
    }

    log.info('parse cost: ' + ($.now() - start));

    return {
      success: success,
      result: result,
      message: message,
      pos: parser.pos
    };
  }
};
//~ ParserModule


});
```

上面还看到，我们在日志中简单地记录了parser cost的时间，这样运行时，我就知道快还是慢了。。

## Html的结构

做了些准备，下面就可以进入正题进行parse html了， 不过还得再准备下，html结构是怎么样的？

由于我们只需要基本的HTML验证，不需要一个完备的HTMLParser, 即不需要考虑到HTML的方方面面
下面是我们的HTML结构(和XML更接近)

```javascript
[
  {
    type: 'element' | 'text' | 'comment'
    name: {string}
    attributes: [{ name: {string}, value: {string}, pos: {number}} ]
    body: 
      {array} if type == 'element'
      {string} if type == 'text' || type == 'comment',
    pos: {number}
  },
  ...
] 
```

1. HtmlParser的结果是一个数组，每个数组元素被称为 Node
2. Node 有三种类型
   element: 元素，就是有tag的，像<div>....</div>
   text: 文本 
   comment: 注释

3. 如果是element, 则包含 name 和 attributes, 表示标签的名称和属性集
4. 如果是element, 它还包含一个body, body也是一个node集合，可以看到这里有一个递归


## 实现

```javascript
var Parser = new Class({
  
  init: function(html) {
    this.html = this.body = html || '';
    this.pos = 0;
  },
```

Parser的构造函数，我们设置了body和pos属性，还记得ParserModule中几个帮助方法中引用的this.body和this.pos吗？就是这个。
有ruby经验的同学对这种mixin的扩展方法会比较亲切


然后就开始我们的“自上而下”了

```javascript
  parse: function(inner) {
    var html = this.html,
      ret = this.result = [];

    while (this.pos < html.length) {
      if (inner && this._check('<\\s*/')) {
        break;
      }
      ret.push(this.parseNode());
    }

    return ret;
  },
```

先不管inner参数， 我们做的就是 对字符串不断地parseNode, 毕竟Html就是由很多Node组成


接着就是parseNode

```javascript
  parseNode: function() {
    if (this._check('<!--')) {
      return this.parseComment(); 
    }

    if (this._check('<')) {
      return this.parseElement();
    }

    return this.parseText();
  },
```

看上面，
1. 如果是<!-- 那这是一个注释。。。
2. 如果是 < 那就是一个 element了
3. 剩下的就是text


再看parseComment

```javascript
  parseComment: function() {
    log.info('parse comment')
    
    var nodePos = this.pos + 1;

    this._skip('<!--');
    this.message = '注释未正常结束';
    var body = this._until('-->');
    this._skip('-->');

    print(body);

    return {
      type: 'comment',
      body: body,
      pos: nodePos
    };
  },
```

将以上代码去掉日志，异常处理，位置信息的记录，就是这样

```javascript
  parseComment: function() {
    this._skip('<!--');
    var body = this._until('-->');
    this._skip('-->');

    return {
      type: 'comment',
      body: body
    };
  },
```

1. 略过<!--
2. 提取到-->
3. 略过-->

有没有一种在字符串中行走的感觉？

下面代码段为了清晰，体现主题，我都把日志，异常记录，位置信息记录语句去掉

先看简单的 parseText

```javascript
  parseText: function() {
    var body = this._until('<|$', true);

    return {
      type: 'text',
      body: body
    };
  },
```

1. parse到 < 或字符串结尾
2. _until(pattern, true) // 这个true表示不trim掉前后的空格，默认我trim掉结果前后的字格



下面是最重要的parseElement

```javascript
  parseElement: function() {
    this._skip('<');          // 1. 略过 <
    var name = this.parseTag(),     // 2. parse tagname, 比如<div 就parse出div这个词
      attrs = this.parseAttributes(), // 3. parse attributes
      enclose = this._check('/'),   // 4. 看看是不是 enclose标签 比如 <div />  
      body = null;

    if (enclose) {
      this._skip('/');        // 5. 如果是enclose标签，需要略过 /
    }

    this._skip('>');

    if (!enclose && $.inArray(name.toLowerCase(), this._enclose) === -1) {
      body = this.parseBody(name);  // 6. 如果不是enclose tag, 则parse body
      this._skip('<\\s*/\\s*' + name + '\\s*>');  // 7. 略过闭合标签，如</div>
    } else {
      body = [];
    }
    
    return {
      type: 'element',
      name: name,
      enclose: enclose,
      attributes: attrs,
      body: body
    };
  },
```

```javascript
  parseTag: function() {
    this._skip('');   // 1. 略过空白
    return this._until('[^-\\w]');  // 2. 直到非-\w
  },
```


parse好tagname后，下面是parseAttributes

```javascript
  parseAttributes: function() {
    var attrs = [];
    while (!(this.pos >= this.html.length || this._check('[/>]'))) {
      attrs.push(this.parseAttribute());
    }
    return attrs;
  },
```

1. 不断地parseAttribute直到标签结尾
2. this.pos >= this.html.length 是为了 如果标签没有正常的结束也能够退出parseAttribute


然后是parseAttribute了，有几种情况，但不复杂

```javascript
  parseAttribute: function() {
    this._skip('');             // 1. 略过空白

    var name = this._until('[^-\\w]'),    // 2. parse出name
      value = undefined,
      q = null;

    if (!name) {
      this._error('invalid property name');
    }

    if (this._check('=')) {         // 3. 如果碰到=, 说明属性有value(html允许孤零零的属性, 虽然不是很标准), 接着要parse属性值
      this._skip('=');          // 4. 略过 =
      if (this._check('"')) {       // 5. 碰到双引号， 那么接下来直到双引号中的内容统统都是属性值
        q = '"';
        this._skip(q);          // 6. 略过双引号
        value = this._until(q);     // 7. parse直到双引号为止
        this._skip(q);          // 8. 略过结尾的双引号

      } else if (this._check("'")) {    // 如果是单引号，则也像上面一样处理单引号的情况
        q = "'";
        this._skip(q);
        value = this._until(q);
        this._skip(q);
      } else {              
        value = this._until('[\\s/>]');   // 无引号的情况
        if (!$.trim(value)) {
          this._error('invalid property value');
        }
      }
    }

    return { name: name, value: value };
  },
```


parseElement, 到现在为止，我们parse了tagName, attributes, 还有内容体没有处理，内容是一个Node集，因此我们可以递归调用parse来处理


```javascript
  parseBody: function(name) {
    return this.parse(true);
  }
```

很干净，但是有点问题，我们有些标签比较特殊，如script, textarea, 它里面的值可以乱写
所以我们要对一些特殊的标签进行处理，这样我们改写下上面的parseBody

```javascript
  parseBody: function(name) {
    if ($.inArray(name.toLowerCase(), this._bodyText) !== -1) {     // 如果是特殊的tag
      var body = this._until('<\\s*/\\s*' + name + '\\s*>', true);  // 就直接parse到该标签的闭合标签，而不管里面是什么内容
      return {
        type: 'text',
        body: body
      }
    }

    return this.parse(true);
  },

  _bodyText: ['textarea', 'script']
```

到这里为止，我们的HtmlParser全部完成了


## 结论

使用LL而不是使用LR后，我感觉有以下几个好处

1. 比较自然，代码比较清晰，从代码就可以体现出整个结构，有种parser的感觉
2. 每个node的parse都能独立调用，单元测试更容易编写  
比如我只想parse一个attribute，则可以直接调用

```javascript
var parser = new HtmlParser(str);
var attr = parser.parseAttribute();
```
3. 可以比较容易地parser出简单的语言，稍微注意下左递归，否则会死循环了。。  
最后广告一下，fdlint，这个是前端代码规范扫描工具，里面有HtmlParser, CssParser, 和JsParser的实现，原理和上面的一样
有兴趣的同学可以看。。
github地址：

https://github.com/qhwa/fdlint
