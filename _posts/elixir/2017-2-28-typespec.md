---
layout: post
title: Elixir -- Dialyzer and type specifications
categories: elixir
---

Dialyzer可以帮助分析代码中可能有问题的地方，它将静态类型检查的一些优势引入到Erlang/Elixir中。大体能检查以下类型的错误

- Type errors - 类型错误
- Code that raises exceptions - 会产生异常的代码
- Unsatisfiable conditions - 不可能为真的条件
- Redundant code - 重复代码
- race conditions - 竞争代码

Dialyzer使用的类型推断算法叫做success typings, 意味着如果它说的你的代码有问题，那么你的代码一定有问题，如果它没检查出什么问题，并不代表你的代码就没问题。


## Elixir中的类型

在iex中可以使用i查看


