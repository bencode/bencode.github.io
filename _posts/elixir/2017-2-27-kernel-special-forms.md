---
layout: post
title: Elixir Kernel.SpecialForms 模块学习
categories: elixir
---

参考：https://hexdocs.pm/elixir/Kernel.SpecialForms.html


这个模块里面函数和宏是构建Elixir的基础设施，所以不可以被开发者覆盖。


## 宏


### %

用于构造一个struct, 本质上仅仅是一个如下结构的map


```elixir
defmodule User do
  defstruct name: "john", age: 27
end
```

```elixir
%User{} = %{__struct__: User, name: "john", age: 27}
```

注意，虽然structs是map，但并没有实现map实现的一些协议，如[Access](https://hexdocs.pm/elixir/Access.html)。


```elixir
iex(1)> user = %User{}
%User{name: "john"}

iex(2)> user.name
"john"

iex(3)> user[:name]
** (UndefinedFunctionError) function User.fetch/2 is undefined (User does not implement the Access behaviour)
             User.fetch(%User{name: "john"}, :name)

iex(4)> other = %{name: "john"}
%{name: "john"}

iex(5)> other[:name]
"john"
```


### %{}

用于构造一个map，为了方便操作，map的内部表达是一个List

```elixir
iex(1)> quote do
...(1)>   %{"name" => :a, c: :d}
...(1)> end
{:%{}, [], [{"name", :a}, {:c, :d}]}
```

### &(expr)

捕获或创建一个匿名函数。

```elixir
iex> fun = &[&1 | &2]
iex> fun.(1, 2)
[1 | 2]   #  这个是什么？没弄明白
```

注意，使用&创建匿名函数时至少得有一个参数占位符


### __MODULE__, __DIR__

几个常用的“常量”

```elixir
__DIR__       # 当前文件目录地址
__MODULE__    # 当前模块名(atom)

__ENV__       # 当前环境信息，比如文件地址信息
__ENV__.file
__ENV__.line  # 当前行，就是这句代码所在行数
```

