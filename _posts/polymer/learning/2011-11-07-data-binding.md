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

```
<span hidden?="{ {isHidden}}">This may or may not be hidden.</span>
```
