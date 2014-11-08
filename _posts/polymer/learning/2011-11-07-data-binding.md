---
layout: post
title: Polymer 学习记录(Data Binding)
categories: polymer learning
---

## Overview

> For Polymer elements, **the model is always the element itself**

```html
<polymer-element name="name-tag">
  <template>
    This is <b>{ {owner}}</b>'s name-tag element.
  </template>
```

```js
document.querySelector('name-tag').owner = 'June'
```

### \<template\>

在Polymer中，使用template定义自定义元素的shadow dom


### 数据绑定和事件处理

在事件绑定方法中可以取得事件源节点和模型


```html
<template repeat="{ {s in stories}}">
  <li on-click={ {selectStory}}>{ {s.headline}}</li>

selectStory: function(e, detail, sender) {
  var story = e.target.templateInstance.model.s
}
```

## Types of bindings

有多种绑定数据和模板的方式


### 单模板实例

```html
<template>
  <template bind="{ {person}}">
    This template can bind to the person object’s properties, like { {name}}.
```

为了方便可以创建*name scope*

```html
<template bind="persion as p">
  ... like { {p.name}}
```

### 循环模板

```html
<template repeat="{ {array}}">
  Creates an instance with { {}} bindings  for every element in the array collection.
```

使用空表达式`{ {}}`表示当前对象


repeat也支持*name scope*

```html
<template repeat="{ {user, userIndex in users}}">
  { {user.name}}
```

repeat可以省略

```js
this.items = [
  { name: 'Milk' },
  ...
]
```

```html
<template bind="{ {item}}">
  <p>items count: { {length}}
  <template repeat>
    <li>{ {name}}</li>
```

### 条件模板

```html
<template if="{ {conditionalValue}}">
  Binds if and only if conditionalValue is truthy.
</template>
```

可以混合使用*repeat*和*if*

```html
<template repeat="{ {item in list.items}}" if="{ {list.showItems}}">
  <li>{ {item.name}}</li>
```

### 引用模板

```html
<template id="myTemplate">
  这个模板可以被其他地方引用
</template>

<template bind ref="myTemplate">
  这里的内容就忽略啦，使用myTemplate模板内容了
</template>
```

### Node Binding

node binding用于关联节点和模型

如何绑定依赖于节点类型和绑定名称，绑定名称和绑定在节点中出现的位置有关系

1. textContent 如 ```<span>{ {someText}}</span>```
2. styleName 如 ```<span style="{ {someStyles}}">```


#### 文本绑定

出现在节点中间的绑定就是textContent binding

比如 `<p>This paragraph has some { {adjective}} text.</p>`

textContent绑定是单向的，改变模型，会改变内容, 但反之不会


#### 属性绑定

如何进行属性绑定和节点类型和属性名有关

1. 大部分标准dom的属性绑定都是单向的，比如style
2. 表单元素，支持双向绑定
3. polymer element的公共属性是支持双向绑定的
4. 自定义元素可以实现自己的绑定方式


#### 表单元素值的绑定

1. input元素的value和checked
2. options元素的value
3. select元素的selectIndex和value
4. textarea的value


#### 条件属性

```html
<span hidden?="{ {isHidden}}">This may or may not be hidden.</span>
```

### 一次性绑定

```html
<input type="text" value="[[ obj.value ]]">
```


## 表达式

### 行为和限制

表达式是javascript的子集

1. 表达式用来处理简单的逻辑，不应该把复杂的逻辑放在表达式中
2. 表达式从来不是使用eval执行，也不能访问global变量。
3. 不能使用表达式插入HTML, 为了防止xss，默认对输出值进行html escape


### 执行

表达式可以使用在以下三种情况 

```
{ {expression}}

[[expression]]

computed: {
  name: expression
}
```

### 上下文(scope)

- bind, repeat, if属性表达式使用的是父模板的作用域
- 最外层模板中表达式和computed属性表达式使用的作用域都是元素本身

### 嵌套作用域规则

对于name scope模板，其父作用域是可见的，否则父作用域不可见

```html
<template>
  <!-- outermost template -- element's properties available -->
  <template bind="{ {organization as organization}}">
    <!-- organization.* available -->
    <template bind="{ {organization.contact as contact}}">
      <!-- organization.* & contact.* available -->
      <template bind="{ {contact.address}}">
        <!-- only properties of address are available -->
        <template bind="{ {streetAddress as streetAddress}}">
          <!-- streetAddress.* and properties of address are available.
               NOT organization.* or contact.* -->
```

### 过滤器

```html
{ {user | formatUserName}}
```

上面的方式，如果user中的字段变化了，表达式不会重新求值,  
因为表达式不知道应该监听什么属性变化，所以得主动告诉它。

```html
{ { {firstName: user.firstName, lastName: user.lastName} | formatUserName}}
```

#### tokenList, styleObject

```html
<div class="{ {{ active: user.selected, big: user.type == 'super' }}}"  
<div style="{ {styles | styleObject}}">
```

#### 自定义过滤器


```js
Polymer('greeting-tag', {
  ...
  toUpperCase: function(value) {
    return value.toUpperCase()
  },
```

需要处理双向绑定的过滤器：

```js
toUpperCase: {
  toDOM: function(value) {
    return value.toUpperCase()
  },
  toModel: function(value) {
    return value.toLowerCase()
  }
}
```

#### 过滤器参数

```
{ {myNumber | toFixed(2)}}

toFixed: function(value, precision) {
  return Number(value).toFixed(precision)
}
```

#### chaining filter

```
{ {myNumber | toHex | toUpperCase}}
```


#### 自定义全局过滤器


```js
PolymerExpressions.prototype.uppercase = function(input) {
  return input.toUpperCase()
}
```

全局过滤器使用html import方式载入

```html
<link rel="import" href="uppercase-filter.html" />
```

