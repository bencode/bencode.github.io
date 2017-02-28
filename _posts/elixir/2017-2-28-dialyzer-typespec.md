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

在iex中可以使用i查看一个对象的信息

``` elixir
iex(1)> i Enum
Term
  Enum
Data type
  Atom
Module bytecode
  /usr/local/Cellar/elixir/1.4.2/bin/../lib/elixir/ebin/Elixir.Enum.beam
Source
  /private/tmp/elixir-20170217-58430-1nqfhsw/elixir-1.4.2/lib/elixir/lib/enum.ex
Version
  [115393136730985393744129633681343494734]
Compile options
  [:debug_info]
Description
  Use h(Enum) to access its documentation.
  Call Enum.module_info() to access metadata.
Raw representation
  :"Elixir.Enum"
Reference modules
  Module, Atom
Implemented protocols
  IEx.Info, Inspect, List.Chars, String.Chars
iex(2)>
```

使用t可以输出类型信息

```elixir
iex(2)> t Enum
@type t() :: Enumerable.t()
@type element() :: any()
@type index() :: integer()
@type default() :: any()

iex(3)> t Enumerable
@type acc() :: {:cont, term()} | {:halt, term()} | {:suspend, term()}
@type reducer() :: (term(), term() -> acc())
@type result() :: {:done, term()} | {:halted, term()} | {:suspended, term(), continuation()}
@type continuation() :: (acc() -> result())
@type t() :: term()
```

## 使用dialyzer

直接使用dialyzer有点小麻烦，需要敲更多命令，所以提供了[dialyxir](https://github.com/jeremyjh/dialyxir)来方便使用。

使用起来很方便，只要将dialyxir添加到deps中

```elixir
defp deps do
  [{:dialyxir, "~> 0.5", only: [:dev], runtime: false}]
end
```

```shell
mix do deps.get, deps.compile
```

编译后就可以使用了

```shell
mix dialyzer
```

## 类型声明

默认情况下dialyzer就能够发现你代码中可能的错误，可以使用type specs让它工作得更好。

类型声明的格式大致如下：

```elixir
@spec function_name(type1, type2) :: return_type
```

常用的类型有 term, boolean, char, number, binary, char_list, list, fun, pid, tuple, map

以下是一些具体的示例

```elixir
@spec add(integer, integer) :: integer
@spec add(integer | float, integer | float) :: integer | float
@spec add(number, number) :: number
```

再来一个复杂的

```elixir
@spec map(f, list_1) :: list_2 when
  f: ((a) -> b),
  list_1: [a],
  list_2: [b],
  a: term,
  b: term
```

## 定义自定义类型

使用@type定义自定义类型

```elixir
defmodule Hexy do
  @type rbg() :: (0..255, 0..255, 0..255)
  @type hex() :: binary
  @type current() :: :sgd | :usd

  @spec rgb_to_hex(rgb) :: hex | {:error, :invalid}
end
```


参考文档

1. The Little Elixir & OTP Guidebook Chapter 10

