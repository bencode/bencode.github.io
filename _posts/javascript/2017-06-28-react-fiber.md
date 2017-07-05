---
layout: post
title: React Fiber介绍
categories: javascript
tags: react
---

React Fiber是一种新的React调度算法(Reconciliation algorithm)，它的目的在于让React更好地应用于动画、布局和手势操作等场景。通过增量渲染等机制，让页面轻松达到60FPS以保证交互的流畅性。

除了增量渲染特性外，Fiber还带来以下特性：

将可中断的任务拆成块。
能够对任务划分优先级。
能够在父子结点间进行渲染切换，为React Layout提供支持。
能够通过render返回多个元素。
为错误边界提供了更好的支持。
在视频 https://www.youtube.com/watch?v=ZCuYPiUIONs 中，LinkClark介绍了Fiber的实现细节，在进度1分钟左右展示的示例，可看到性能有明显的提升。

Fiber的实现主要依赖于requestIdleCallback和requestAnimationFrame这两个API，将任务拆成块放到requestIdleCallback中执行，以保证不丢帧。 

它将渲染折成两个阶段，第一个阶段的任务可中断，可暂停，可重复执行，所以就可以对这些任务分步执行，第二个阶段任务会更新DOM，不可拆分，需要一气呵成。

在第一阶段可能会调用以下生命周期函数：

componentWillMount
componentWillReceiveProps
shouldComponentUpdate
componentWillUpdate
这一阶段的任务可能被打断重来，所以这些方法应保证可多次调用无副作用（幂等性）。

在第二阶段会调用以下生命周期函数：

componentDidMount
componentDidUpdate
componentWillUnmount
具体细节查看：https://zhuanlan.zhihu.com/p/2602708

根据这些API的特性，我们的代码绝大多数都不需要修改就能无缝升级。

计划在v16版本就可以使用这个特性了，在 http://isfiberreadyyet.com/ 页面中可以看到目前单测的进度，相信很快就可以使用了。

我在目前的项目中尝试了v16的alpha版，不需要任何修改就能正常工作，所以升级应该是无缝的。
