---
layout: post
title: 使用Ecto Fragment支持自定义排序。
categories: elixir
---

ecto的功能很强大，但有时候找不到直接支持的特性，此时可以使用[fragment](https://hexdocs.pm/ecto/Ecto.Query.API.html#fragment/1) 构造自定义SQL完成查询。

最近的项目中就碰到这样的场景：

我有一堆页面列表，这个页面列表是根据关键字和页面状态查询出来的，然后根据修改时间排序并分页。  

现在有个新需求，每个用户都会有一些收藏的页面，我希望在上述查询结果中如果出现收藏的页面，则优先展示。即希望在`order by`中使用 `case when` 语句。


相关代码如下：


```elixir
  like_ids = Like.get_items(user.id)
  query = from Page
        |> to_base_query
        ...
        |> query_with_order_by(like_ids)

```

以下是`query_with_order_by`的代码。


```elixir
  # 按更新时间排序
  defp query_with_order_by(base, []) do
    from(p in base, order_by: [desc: p.updated_at])
  end

  # 优先按id排序, 其次根据更新时间排序
  defp query_with_order_by(base, ids) do
    from(p in base, order_by: fragment("case when id = ANY(?) then 0 else 1 end", ^ids),
                    order_by: [desc: p.updated_at])
  end
```

上面代码中，我们使用`fragment`注入自定义sql语句。


