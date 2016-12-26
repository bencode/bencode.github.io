---
layout: post
title: 一个前端验证组件的实现
categories: javascript
---

## 背景

我们的业务主要以展示为主，输入的表单都不复杂，但零零碎碎总有一些，所以需要一个简单的Validation来简化前端验证逻辑的编写

## 示例

先看一些例子了解如何使用这个组件

1. 非空验证

```javascript
var elm = $('...');   // 取得节点

var v = new Validation(elm, { // 初始化验证器
  type: 'require',
  message: '内容不能为空'
});
```


2. 正则式

```javascript
new Validation(elm, {
  type: /^\d+$/,
  message: '只能为数字'
});
```


3. 多个验证器

```javascript
new Validation(elm, [

{
  type: 'require'
  message: '内容不能为空'
},

{
  type: 'price'
  message: '价格格式不正确'
},

{ 
  type: function(v) {
    return v > 100 * 10000;
  },
  message: '金额不能小于100万'
}

]);
```

4. 不同的验证时机(触发条件)

验证触发条件有好些， 比如鼠标录入完后离开输入框（focusout）, 或者输入过程中就会进行效验(instant)

```javascript
new Validation(elm, {
  handler: 'instant', // 即时效验
  rules: {
    type: /^\d+$/
  } 
});
```

5. 不同的验证出错提示

```javascript
new Validation(elm, {
  advice: 'myadvice',
  rules: ...
});
```


6. 同时对一组元素应用一组规则

```javascript
var elms = ... // 包含多个元素

new Validation(elm, ...);
```


## 接口

综上所述，我们的验证器接口大概是这样的

```javascript

/**
 * @param {jquery} elm, 待验证的元素，可以对一个节点也可以对多个节点使用
 * @param {object} config
 */
var Validation = function(elm, config);

```

config表达了整个验证规则, 完整的结构如下

```javascript
{
  handler: {string} | {function}  验证时机  
  advice: {string} | {function} 提示方式 
  rules: [
    {
      type: {string} | {object} | {function},
      value: 验证器额外参数
      message: {string} | {object} 出错信息
        - promptMessage   录入提示
        - successMessage  成功提示        
        - errorMessage    出错提示
    }
    ...
  ]
}
```

完整的config比较复杂，但是可以简化使用

1. handler不配置，则为default
2. advice不配置，则为default
3. rules不配置，整个config就是rules
4. 元素只有一个验证器，则rules不需要是数组
5. message 如果是字符串，则为errorMessage

```javascript
/**
 * 验证方法
 * @return {boolean} 
 */
Validation#validate = function()
```


## 代码

终于到这里了

```javascript
var Validation = new Class({

  init: function(elm, config) {
    elm = $(elm);
    if (elm.length > 1) {
      return this._createGroup(elm, config);
    }

    elm.length === 1 || log.error('empty element for validation');
    ...
  },

... 
});
```

首先处理的是元素>1的情况， 按照道理，是应该对每个元素分别初始化Validation即可

```javascript
  _createGroup: function(elms, config) {
    var vs = [];  
    elms.each(function(i) {
      vs[i] = new Validation(this, config);
    });

    return {
      validate: function(noAdvice) {
        for (var i = 0, c = vs.length; i < c; i++) {
          if (!vs[i].validate(noAdvice)) {
            return false;
          }
        }
        return true;
      }
    };
  },
```

上述代码，我们循环对每个节点构造Validaiton, 然后放到一个集合中 vs

返回一个新的对象，这个对象也有一个validate方法

这是一个Composite模式的实现， 只是比较隐晦, _createGroup当然也是创建这个Composite的工厂。
在JS中，接口是基于约定的，对象构造是基于原型的, 没有独立的类， 如果一个对象用来创建一个对象，那么这个对象就是那个对象的类

接着看构造函数余下的部分

```javascript
  init: function(elm, config) {
    elm = $(elm);
    if (elm.length > 1) {
      return this._createGroup(elm, config);
    }

    elm.length === 1 || log.error('empty element for validation');
    //----------------- 这里开始
    this.elm = elm; 
    
    config = config || {};
    this.config = config.rules ? config : { rules: config };

    this.advice = this._createAdvice();
    this.handler = this._get('Handler', this.config.handler);
    
    this.handler(this.elm, $.proxy(this, 'validate'), this.advice);

    this.rule = {};
  },
```

上面这段代码共做了以下几件事

1. 对config.rules省略的情况处理
2. 创建advice
3. 创建handler
4. 调用handler初始化验证


## Advice

接着是
```javascript
this.advice = this._createAdvice();
```

advice用来提示信息的


下面是默认Advice的实现

```javascript
Validation.Advice = {
  'default': {
    prompt: function(elm, rule) {
      FormUtil.alert(elm, rule.promptMessage, 'prompt');
    },

    success: function(elm, rule) {
      FormUtil.alert(elm, rule.successMessage, 'success');
    },

    error: function(elm, rule) {
      FormUtil.alert(elm, rule.message || rule.errorMessage, 'error');
    }
  }
};

```

所以Advice是实现prompt, success,及error三个方法的对象

默认的Advice实现非常直接，仅仅调用FormUtil去展示出错、提示、成功等信息


```javascript
  _createAdvice: function() {
    var self = this,
      advice = this._get('Advice', this.config.advice);
    return {
      prompt: function() {
        advice.prompt && advice.prompt(self.elm, self.rule);  
      },
      success: function() {
        advice.success && advice.success(self.elm, self.rule);  
      },
      error: function() {
        advice.error && advice.error(self.elm, self.rule);
      }
    };
  },
```

createAdvice会根据配置，取得advice对象，然后简单包装一下，以方便它在handler及validation内部使用


## _get 工厂

  _get: function(type, name) {
    name = name || 'default';
    name = typeof name === 'string' ? Validation[type][name] : name;
    name || log.warn('module not exist for ' + type + ':' + name);
    return name;
  }

_get是一个工厂方法，用来根据用户配置取得一些对象
在Validation内部，主要用于根据配置获取  advice对象和handler对象，以及还未介绍的validator对象

1. type用于指定，要获取什么对象 Handler, Advice还是Validator
2. name是对象名称
  如果是string, 则从Validation集合中获取 
  如果是其他，则当作对象本身返回


所以我们默认没有指定advice, 就用default, 也可以用其他内置的advice, 当然也可以提供一个符合Advice接口的对象

这个工厂，配合Validation集合， 组成了一个策略模式


## 验证

```javascript
  validate: function(noAdvice) {
    if (!this.enable) {
      return true;
    }

    var self = this,
      value = $.trim(this.elm.val()),
      advice = this.advice,
      rules = $.makeArray(this.config.rules),
      valid = true;

    $.each(rules, function(index, rule) {
      if (!$.isPlainObject(rule)) {
        rule = { type: rule };
      }
      self.rule = rule;

      valid = self._validate(value, rule);
      if (!valid) {
        return false; // break
      }
    });

    noAdvice || advice[valid ? 'success' : 'error']();

    return valid;
  },
```

1. noAdvice 表示仅验证一下，不使用Advice(即只想得到验证结果，不想显示出错信息)
2. $.makeArray 即是用来处理只有一个验证器时，不需要写数组这次特列的
3. 然后对所有的规则，依次进行效验
4. 如果不通过，则调用advice进行展示

可以看到，验证的逻辑是由 _validate这个方法实现的


下面是_validate的逻辑

```javascript
  _validate: function(value, rule) {
    var type = rule.type; 
    // require
    if (type === 'require') {
      return !!value;
    }

    // other empty
    if (type !== 'require' && !value && !rule.force) {
      return true;
    }

    var validate = this._get('Validator', type);
    if (!validate) {
      log.error('validator ' + type + ' not exist');
      return false;
    }

    return validate.test ? validate.test(value, rule.value) :
        validate(value, rule.value);
  },
```

1. 有一个特殊的验证器叫 'require'(非空), 我们对它进行特别处理下
2. 其他所有的验证都是在有值的的情况下进行的
3. 我们还是通过_get取得 Validator
4. 然后调用验证
  validate.test ? validate.test(....
    validate(value, ...

  4.1 这说明我们的验证器是一个具有test方法的对象
    正则表达式
    当然你也可以提供一个具有test方法的对象

  4.2 验证器也可以是一个普通方法

这里没有做类型检测，而是做“能力”检查，这被称为duck typing

## 验证器

看一下内置验证器

```javascript
Validation.Validator = {
  
  price: function(v) {
    return /^[\d]{0,9}(\.[\d]{0,2})?$/.test(v);
  },

  pattern: function(v, pattern) {
    return new RegExp(pattern).test(v);
  },

  'not-pattern': function(v, pattern) {
    pattern = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return !pattern.test(v);
  },

  maxlength: function(v, maxlength) {
    return v.length <= parseInt(maxlength, 10);
  },

  range: function(v, options) {
    options = options || [];  
    if (!/^\d+(\.\d+)?$/.test(v)) {
      return false;
    }

    var min = options[0] ? parseFloat(options[0]) : Number.MIN_VALUE,
      max = options[1] ? parseFloat(options[1]) : Number.MAX_VALUE;

    v = parseFloat(v);
    return min <= v && v <= max;
  },

  custom: function(v, module) {
    require(module, function(validator) {
      return validator(v);
    });
  },

  'alibaba-link': function(url) {
    var list = null;
    ...
  }

```

实现的都比较直接，有 价格，正则式，宽度，区域，链接等

## Handler

最后还剩下Handler 看一眼默认的实现

```javascript
Validation.Handler = {

  'default': function(elm, validate, advice) {
    elm.on('focus', function() {
      advice.prompt();
    });

    elm.on('blur', function() {
      validate(); 
    });
  },
;
```


比较简单，focus时提示，blur时验证


再看一下另一种handler: instant

```javascript
Validation.Handler = {
  ...,
    
  instant: function(elm, validate) {
    elm.on('input propertychange', function() {
      var input = $(this),
        last = input.data('validationValue') || '',
        value = $.trim(input.val());
      
      if (validate()) {
        input.data('validationValue', value);
      } else {
        // 延迟设置已防止再次触发input/propertychange, 以造成堆栈溢出
        setTimeout(function() {
          input.val(last);
        }, 50);
      }
    });

    elm.triggerHandler('input');
  }
  
};
```

这有点小复杂。 实现得也不是很好

主要是考虑到浏览器兼容性才用了 input和propertychange这两个事件作为触发条件

## 总结

用到的模式：工厂，策略，组合

用到的原则：

单一职责（一个实体仅有一个引起他变化的原因）
 比如 Validation由 Advice, Handler, Validator三部分组成，是因为这三个东西，每个东西都有几种变体，所以分成三个，以让每个实体职责单一
 当然如果我们整个系统只有一种Advice，则没必要分出Advice

开放封闭
  我们上面添加任何一种Advice, Handler, Validator都不需要修改原来的代码，只要增加代码即可

优先使用组合，而不是继承
