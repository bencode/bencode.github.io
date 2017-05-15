---
layout: post
title: Why Elixir
categories: elixir
tags:
  - translation
---

原文地址 [Why Elixir](http://theerlangelist.com/article/why_elixir)


*本文作者具有十几年web开发和桌面开发经验。他使用过各种各样的语言，包括 Elixir, Erlang, Ruby, Javascript, C#和C++。 同时他也是《Elixir Action》这本书的作者。*


我使用Elixir已差不多一年时间了。 一开始我只是在blog上使用它更好地演示Erlang虚拟机（EVM）的一些优势。 但随后就被它的特性所吸引，并很快将它应用到之前基于Erlang开发的系统中。本文尝试说明Elixir的一些优点并消除对它的一些误解。


## Erlang编程语言的问题


EVM上的很多特点让构建高可用，可扩展，容错的分布式系统更加容易。网上有很多关于它的评论，我也写过一些相关的blog，比如[link](http://theerlangelist.blogspot.com/2012/12/yet-another-introduction-to-erlang.html)和[link](http://theerlangelist.blogspot.com/2013/01/erlang-based-server-systems.html)，在即将出版的《Elixir In Action》的第一章也说了一些Erlang和Elixir的特性。


长话知说，Erlang为管理高可扩展的容错系统提供了极好的抽象，这在需要执行成千上万独立或低依赖任务的并发系统中就显得极其必要。我在生产环境中使用Erlang已超过3年时间，在这期间我开发一个基于HTTP长轮询的推送服务，它在高峰期性能可超过2000 QPS（无缓存）。在这之前我从来没有编写过类似规模和稳定性要求的系统，它不需要特别处理就可以运行得很好。而这实际上是我写的第一个Erlang代码，它充斥着反模式和糟糕的实现。尽管如何，EVM被证明是非常健壮的，它会尽可能的让代码稳定工作。最重要的是，基于Erlang的并发机制让我可以简单直接地处理这些复杂问题。

尽管有这么多好的特性，但编写Erlang代码从来不让我感到愉悦，编码体验不是很流畅，产出的代码中总是充斥着过多的重复代码。这不是语言语法的问题。在我还是学生时，我写过一阵子Prolog，很喜欢这门语言，同理我也应该很喜欢Erlang语法的, 甚至实际上我觉得它很多地方都比Elixir更加优雅。问题的根源在于我是一名OO开发者，我花费多数时间在诸如Ruby、Javascript、C#、C++等语言上。

我使用Erlang的问题是，觉得它简单到很难消除模板和结构性重复代码，结果产生的代码就会很混乱最终难以分析和修改。在使用过一段时间Erlang后，我觉得函数式编程在代码的有效组织上不如面向对象编程。


## Elixir是(不是)什么

这是Elixir改变我的地方。在我使用足够长时间后，我最终体会到了函数式编程的美。现在我不再认为我更喜欢面向对象编程了。在使用Elixir编程时，我感觉很好，并且能够专注于解决的问题上，而不是处理语言细节上。

在讨论Elixir的具体特性前，有件事需要重点提醒：Elixir不是Erlang的Ruby版本，也不是Erlang的Coffeescript, Closure，C++等其他语言版本。 Elixir和Erlang的关系是独特的，Elixir在语义上更加靠近Erlang，并且额外引入了其他语言的一些思想。从结果来看，表面上看起来像Ruby, 实际上更加接近Erlang，它们具有完全相同的类型系统，一样的函数调用逻辑。

所以对我来说，Elixir就是加强了代码组织能力的Erlang. 这个定义和你在官网上看到的不同，但我觉得在和Elang做对比时能够抓住本质。

让我对这点详细说一下。我认为一门程序语言应该具有以下职责。


- 作为控制一些东西的界面，比如硬件、虚拟机、运行程序、UI界面。
- 塑造开发人员对他们正在建模世界的看法对指。
  OO语言让我们发现具有状态和行为的对象，而在函数式编程语言中，我们思考数据和转化。
  声明式编程语言强制我们思考规则，而在命令式语言中，我们会思考一系列动作。
- 提供工具用于组织代码，消除重复、模板代码以及噪声，并希望以近可能接近我们理解问题的方式来表达。

对于前面两点，Erlang和Elixir没有什么区别， 它们都运行在EVM上，并且采用函数式编程方法。
在第3点，Elixir在Erlang基础上作了改进，它提供额外的工具组织我们的代码，并且希望更有效地编写产品级可维护的代码。


## 特性

网上有太多关于Elixir的资料, 我特别喜欢两篇来自Devin Torres的文章，你可以在这找到[link](http://devintorr.es/blog/2013/01/22/the-excitement-of-elixir/) [link](http://devintorr.es/blog/2013/06/11/elixir-its-not-about-syntax/)。Devin是一个有经验的Erlang开发者且编写过一个很受欢迎的poolboy库，所以他关于Elixir的思考的文章值得一读。关于这些，我不想重复太多，也避免深入一些机械的细节。相反，让我们浏览一些能够帮助我们更好组织代码的特性。


### 元编程

Elixir元编程有几种形式，但其本质是一样的。它允许我们编写简洁的结构，这些结构就像语言的一部分。 这些结构在编译期被转化成合适的代码。从实现层面，它帮助我们去除结构性重复代码 - 这种场景下，两块代码具有相同的抽象样式，但是在其他细节方面则不同。

举个例子，以下代码片段表示`User`模块：

```elixir
defmodule User do
  # initializer
  def new(data) do ... end

  # getter
  def name(user) do ... end
  def age(user) do ... end

  # setter
  def name(value, user) do ... end
  def age(value, user) do ... end
end
```

其他Record类型也具有这种样式，但具有不同的字段。 代替复制粘贴，我们可以使用Elixir `defrecord` macro：

```elixir
defrecord User, name: nil, age: 0
```

根据给定的定义，defrecord生成一个专用模块，它包含用于处理用户记录的功能。
因此，公共的模式仅在一个地方（defrecord宏的代码）被出现，而特定的逻辑与实现细节解耦。

Elixir的宏不像C/C++，它们不操作字符串，它们更像编译期的Elixir函数，即在编译解析阶段被调用。
宏操作的是抽像语法树（AST），AST是使用Elixir数据结构表示的代码。宏可以加工AST，并且吐出新的AST来产生代码。
宏在编译期执行，所以在运行期效率不会受影响。同样使用代码片段去改变定义的模块也就不奇怪了（这在Javascript和Ruby中也是可以的）。

有了宏以后，大部分Elixir特性是使用Elixir编写的，包括一些基本结构，比如`if`, `unless` 以及单元测试支持。
还有比如：Unicode的支持，产生unicode环境相关的字符串方法如`downcase`和`upcase`等等。 这反过来可以让开发人员更好地为Elixir贡献。

宏还允许三方库作者提供更加自然的DSL语言。比如`Ecto`为`Elixir`提供有点类似`LINQ`语法的查询语句，对于我个人而言，这是体现宏强大威力的最爱。

我见过一些人说不需要元编程而放弃Elixir。虽然强大，但元编程也可能变得非常危险，所以被建议小心采用。
有很多特性是元编程带来的，即使你并不编写宏，你仍在享受它带来的好处，比如上面提及的records, unicode支持以及综合的查询语句。


## 管道运算符

这个看似简单的操作符却如此有用，在Elixir中注意到它存在之前，我甚至“发明”它的[Erlang版本实现](https://github.com/sasa1978/fun_chain)。

我们首先看下问题。在Elang中没有管道操作符，此外也不能重新赋值。因此Erlang代码往往编写成以下样式。

```erlang
State1 = trans_1(State),
State2 = trans_2(State1),
State3 = trans_3(State2),
...
```

这段很傻的代码依靠中间变量挨个地传递结果给下一次调用。 我实际上还犯过一恶心的Bug，因为不小心把`State6`写成`State7`了。

当然，我们可以重构成内联函数调用形式：

```erlang
trans_3(
  trans_2(
    trans_1(State)
  )
)
```

正如你的看到的，代码很快就变恶心了，这在函数带有额外参数以及转化次数更多时会变得更加糟糕。

管道运算符可在不使用中间变量情况下组合不同的操作:

```elixir
state
|> trans_1
|> trans_2
|> trans_3
```

代码读起来和意图一致，从上到下。它突出FP的一个特点，即函数是数据转化器，并且能灵活组合达到期望的结果。


举个例子，以下代码计算所有正数的平方和：

```elixir
list
|> Enum.filter(&(&1 > 0))
|> Enum.map(&1 * &1)
|> Enum.reduce(0, &(&1 + &2))
```

管道运算符工作的很好的原因是，Elixir库的API遵循一个约定：“主语作为第一个参数"。 Elixir “要求” 所有函数要操作的对象都应作为第一个参数。 所以`String` 模块函数的第一个参数都是string， 而`Enum`模块函数的第一个参数都是`enumberable`。


## 多态和协议

`Protocals`是Elixir提供的类似于OO中的`interfaces`这样的东西。一开始我对它并不感冒，不过随着时间的进行，我开始看到它带来的一些优势。`Protocals`允许开发者创建可以被任意类型数据使用的公共逻辑，因为这些数据会基于一些约定。

一个极好的例子是`Enum`模块，它提供了许多函数用于操作任何可枚举(enumerable)的东西。举个例子，这是我们如何迭代一个对象：

```elixir
Enum.each(enumberable, fn -> ... end)
```

`Enum.each`能工作在各种不同类型数据上，比如`lists` 或者 `key-value` 字典，
当然只要实现对应的协义，就可以支持我们自定义的类型。这类似于OO中的接口，不同的是，在没有类型的源码下，我们也可以为一个类型实现协议。

一个最有用的关于协议的示例就是`Stream`模块， 它实现了一个延迟的，可组合的可枚举抽象。
搭配Stream和Enum就可以实现，"组合不同的枚举操作，但却仅在需要时产生结果这个功能"。举个例子，这是计算列表中所有正数平方和的代码：

```elixir
list
|> Stream.filter(&(&1 > 0))
|> Stream.map(&(&1 * &1))
|> Enum.reduce(0, &(&1 +&1))
```

在第2和第3行中，操作仅仅被组合，但并未没有执行，它的结果是一个实现了`Enumberable`协议的对象。 一旦我们将这个对象传递给`Enum`函数(第3行），它就开始产生数据。
而Elixir编译器除了提供协议这种机制外，不需要为延迟操作提供任何额外支持。

