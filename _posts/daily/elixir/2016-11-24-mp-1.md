---
layout: post
title: 读书笔记《Metaprogramming Elixir》
categories: elixir metaprogramming
---

# The Language of Macros


首先看到两个元编程的示例，说是在下一章会实现。

```elixir
while Process.alice?(pid) do
  send pid, {self, :ping}
  receive do
    {^ping, :pong} -> IO.puts "Got pong"
  after 2000 -> break
  end
end
```

Elixir是没有while语句的。

```elixir
div do
  h1 class: "title" do
    text "Hello"
  end
  p do
    text "Metaprogramming Elixir"
  end
end
"<div><h1 class=\"title\">Hello</h1><p>Metaprogramming Elixir</p></div>"
```

实现了一个创建html模板的DSL。

```elixir
iex(3)> quote do: 1 + 2
{:+, [context: Elixir, import: Kernel], [1, 2]}
iex(4)> quote do: div(10, 2)
{:div, [context: Elixir, import: Kernel], [10, 2]}
```

使用`quote`可以得到表达式的抽象语法树。

```elixir
def write(path, contents) do
  Logger.debug "Writing contents to file #{file}"
  File.write!(path, contents)
end
```

生产环境中，Logger.debug语句会被移除。


```elixir
iex> h if
  defmacro if(condition, clauses)

iex> h Logger.debug
  defmacro debug...
```

可以看到`if`和`Logger.debug`都是宏。

组合起来实现"会说话"的+和*

```elixir
iex(7)> quote do: 5 + 2
{:+, [context: Elixir, import: Kernel], [5, 2]}
iex(8)> quote do: 1 * 2 + 3
{:+, [context: Elixir, import: Kernel],
 [{:*, [context: Elixir, import: Kernel], [1, 2]}, 3]}
```

[示例](https://github.com/bencode/learn-elixir/blob/master/mp/macros/math.exs)


### 编写宏的规则

- 规则1：不要编写宏
- 规则2：Use Macros Gratuitously # 这个应该如何翻译？


lisp语法本身就是AST，而elixir使用更友好的语法(hign-level)操作AST。

AST Literals

对原子，数字，列表，字符串（二进制），tuple进行quote返回自身。

```elixir
quote do: :atom
quote do: 123
quote do: 3.14
quote do: [1, 2, 3]
quote do: "string"
quote do: {:ok, 1}
quote do: {:ok, [1, 2, 3]}
```

map不是哦

```elixir
iex(15)> quote do: %{a: 1, b: 2}
{:%{}, [], [a: 1, b: 2]}
```

### unquote

```elixir
number = 5
ast = quote do
  number * 5
end

Code.eval_quoted ast
# 会编译错误

ast = quote do
  unquote(number) * 10
end

# {:*, [context: Elixir, import: Kernel], [5, 10]}
Code.eval_quoted ast
# {50, []}
```

### 宏展开

当编译器碰到一个宏时，它会递归展开直至不包含任何宏。

```elixir
ast = quote do
  ControlFlow.unless 2 == 5, do: "block entered"
end

expanded_once = Macro.expand_once(ast, __ENV__)

expanded_fully = Macro.expand_once(expanded_once, __ENV__)
```

expanded_once

```elixir
{:if, [context: ControlFlow, import: Kernel],
 [{:!, [context: ControlFlow, import: Kernel],
   [{:==, [context: Elixir, import: Kernel], [2, 5]}]}, [do: "block entered"]]}
```

expanded_fully

```elixir
{:case, [optimize_boolean: true],
 [{:!, [context: ControlFlow, import: Kernel],
   [{:==, [context: Elixir, import: Kernel], [2, 5]}]},
  [do: [{:->, [],
     [[{:when, [],
        [{:x, [counter: -576460752303422890], Kernel},
         {:in, [context: Kernel, import: Kernel],
          [{:x, [counter: -576460752303422890], Kernel}, [false, nil]]}]}],
      nil]}, {:->, [], [[{:_, [], Kernel}], "block entered"]}]]]}
```

### 上下文

[示例](https://github.com/bencode/learn-elixir/blob/master/mp/macros/callers_context.exs)演示了`quote`内外是在不同的上下文中执行的。  
宏内`quote`外的代码是在注入前执行，`quote`内的代码是在注入到目标后执行。  

输出结果为

```elixir
iex(1)> c "callers_context.exs"
In macro's context (Elixir.Mod).
In caller's context (Elixir.MyModule).
[MyModule, Mod]
iex(2)> MyModule.friendly_info
My name is Elixir.MyModule
My functions are [friendly_info: 0]
```

### 宏卫生

定义在宏中的 变量，imports, aliases不会泄漏到注入的模块中。

```elixir
ast = quote do
  if meaning_to_life == 42 do
    "it's true"
  else
    "it remains to be seen"
  end
end

Code.eval_quoted ast, meaning_to_life: 42
# Compile Error...
```

但可以使用`var!`显示地打破这个规则。

```elixir
ast = quote do
  if var!(meaning_to_life) == 42 do
    "it's true"
  else
    "it remains to be seen"
  end
end

Code.eval_quoted ast, meaning_to_life: 42
# {"its true", [meaning_to_life: 42]}

Code.eval_quoted ast, meaning_to_life: 100
{"it remains to be seen", [meaning_to_life: 100]}
```

[示例](https://github.com/bencode/learn-elixir/blob/master/mp/macros/setter2.exs)

