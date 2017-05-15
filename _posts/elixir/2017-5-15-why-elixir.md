---
layout: post
title: Why Elixir
categories: elixir
---

原文地址 [Why Elixir](http://theerlangelist.com/article/why_elixir)


*本文作者具有十几年web开发和桌面开发经验。他使用过各种各样的语言，包括 Elixir, Erlang, Ruby, Javascript, C#和C++。 同时他也是《Elixir Action》这本书的作者。*


我使用Elixir已差不多一年时间了。 一开始我只是在blog上使用它更好地演示Erlang虚拟机（EVM）的一些优势。 但随后就被它的优点所吸引，并很快将它应用到之前基于Erlang开发的系统中。本文尝试说明Elixir的一些优点并消除对它的一些误解。


## Erlang编程语言的问题


EVM上的很多特点让构建高可用，可扩展，容错的分布式系统更加容易。网上有很多关于它的评论，我也写过一些相关的blog，比如[这里](http://theerlangelist.blogspot.com/2012/12/yet-another-introduction-to-erlang.html)和[这里](http://theerlangelist.blogspot.com/2013/01/erlang-based-server-systems.html)，在即将出版的《Elixir In Action》的第一章也说了一些Erlang和Elixir的特点。


长话知说，Erlang为管理高可扩展的容错系统提供了极好的抽象，这在需要执行成千上万独立或低依赖任务的并发系统中就显得极其必要。我在生产环境中使用Erlang已超过3年时间，在这期间我开发一个基于HTTP长轮询的推送服务，它在高峰期性能可超过2000 QPS（无缓存）。在这之前我从来没有编写过类似规模和稳定性要求的系统，它不需要特别处理就可以运行得很好。而这实际上是我写的第一个Erlang代码，它充斥着反模式和糟糕的实现。尽管如何，EVM被证明是非常健壮的，它会尽可能的让代码稳定工作。最重要的是，基于Erlang的并发机制让我可以简单直接地处理这些复杂问题。

尽管有这么多好的特性，但编写Erlang代码从来不让我感到愉悦，编码体验不是很流畅，产出的代码中总是充斥着过多的重复代码。这不是语言语法的问题。在我还是学生时，我写过一阵子Prolog，很喜欢这门语言，同理我也应该很喜欢Erlang语法的, 甚至实际上我觉得它很多地方都比Elixir更加优雅。问题的根源在于我是一名OO开发者，我花费多数时间在诸如Ruby、Javascript、C#、C++等语言上。

我使用Erlang的问题是，觉得它简单到很难消除模板和结构性重复代码，结果产生的代码就会很混乱最终难以分析和修改。在使用过一段时间Erlang后，我觉得函数式编程在代码的有效组织上不如面向对象编程。


