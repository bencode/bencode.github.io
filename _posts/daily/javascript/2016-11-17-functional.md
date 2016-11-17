---
layout: post
title: 函数式编程
categories: javascript
---


## 代数

1. 自反
2. 对称
3. 传递
4. 结合


## Setoid
equals(v)

## Semigroup
concat(v)

## Monoid

include Semigroup
empty()


## Functor

map(f)


## Apply
include Functor
ap


## Applicative
include Apply
of


## Alt
include Functor
alt


## Plus
include Alt
zero()


## Alternatively
include Applicative, Plus


## Foldable
reduce(f, x)


## Traversable
include Functor, Foldable
traverse(f, of)


## Chain
include Apply
chain(f)

## ChainRec
include Chain
chainRec(f, i)


## Monad
include Applicative, Chain


## Extend
extend(f)


## Comonad
include Functor, Extend
extract()


## Bifunctor
include Functor
bimap(f, g)


## Profunctor
include Functor
promap(f, g)

