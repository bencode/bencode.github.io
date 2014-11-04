---
layout: post
title:  "Swift学习笔记-基础"
date:   2014-11-02 23:41:11
categories: swift
---

可以使用xcode的playground边写边学


## 常量变量

```swift
let maxCount = 15
var index = 0
```

使用let申明常量，使用var申明变量。

let类似于java中的final, 适合一次初始化多次使用。


```swift
var message: String
```

类型申明的格式还是和Object C一样，只是在swift中大大加强了编译器推断能力，这是swift语言的一大特点，虽然是强类型语言，但却有动态语言简洁的形。


```swift
let π = 3.14159
let 你好 = "你好世界"
```

变量名可以使用中文哦〜 ，虽然正常情况下没什么用，但是搞吧搞吧估计能进行中文编程了。


## 注释

```swift
这是一个注释
```
