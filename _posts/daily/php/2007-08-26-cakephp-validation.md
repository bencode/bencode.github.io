---
layout: post
title: CakePHP Validation
categories: php
---


和Rails 一样,  CakePHP的Model也有Validation

它通过配置其 validate 数组, 就可以进行验证,  阅读了源码, 整理出 validate数组可能的结构, 以及验证的过程

1. 首先, 如果重写了 beforeValidate,  那么它先处理这里的东东... 以决定是否进行下一步验证
2. 然后才会根据 validate数组, 进行实际验证

```php
var validate => array(
    ...
    fileldName => ruleSet
    ...
);
```

validate 数组大概是以上结构. 那么 ruleSet, 可能具有哪些情况呢?

ruleSet 可有三种情况:

```
1. string, 可以是正则式, 方法名, 或者...(见下面)
2. array('rule' => validator);    一个 key 为 rule 的单元素数组, 
3. array( 
    ...
    index => validator
    ...
)
```

第三种情况,是最复杂的, 第一第二种其实是第三种的特殊情况
它表示, 一个 field有很多个 validator, 需要通过所有 的 validator 才算通过

那么 validator 可以是什么呢?

```
1. string, 上面有过哦, 可以是正则式, 或者方法名 .. 或者...
2. array(    // 又是一个 array, 看来, 这个总的结构还可以真复杂呀
                   //  array中大概可以具有以下元素. 
    'allowEmpty' => null,
    'required' => null,
    'rule' => 'blank',           //  这里有个 rule 哦...
    'last' => false,
    'on' => null

    'message' =>null         //   如果是空, 那么将被设置为:  This field cannot be left blank
)
```

好了.. 总结.   其实最复杂的结构像是这样的:

```php
var validate => array(
    fileldName1 => ...
    fileldName2 => array{
           index1 => ...
            index2 => array(
               'allowEmpty' => null,
               'required' => null,
                'rule' => 'blank',           //  这里有个 rule 哦...
               'last' => false,
                'on' => null

                'message' =>null         //   如果是空, 那么将被设置为:  This field cannot be left blank
            )
            ...
    };
    ...
);
```


其他所有结构.都只不过是上面结构的特殊情形

程序在分析这个 validate 字段, 然后构造了上面这个结构. 下面就开始验证了. 其验证过程比较简单哦:

上面不是有 'on' 'allowEmpty' 这些字段吗?

那么第一步

1\. 如果 empty(on) || (on == 'create' && !exists) || (on == 'update' && exists) 就进行验证

说白了. 就是 on 为空, 或者为 'create' 而且数据库中没有相关记录,  或者为 'update' 而且数据库中具有相关记录, 那么进行验证

所以, 我们验证的时候.可以在 网页上看到 debug信息,说是查询数据库用了多少毫秒(心里不知道怎么回事,明明没写什么find findAll)  原因就在这里.

2\. 然后根据 allowEmpty 以及 required 信息, 进行空与非空验证,  如果通过这步, 再进行 3

3\. 然后再根据 rule  进行验证 

上面说了 rule 可以是 string(表示一个正则式, 或一个方法名), 但它其实还可以是一个 array 

如果 rule 是一个 array, 那么  array[0] 这个元素, 就被作为 rule , 其余元素作为验证的参数

等等. 验证不是对表单输入的数据进行验证的话? 是的.  所以 data[fieldName]. 就是需要验证的东东. 

所以. 最后. 验证参数, 是由两部分 combine 成的: 1. 表单值 2. rule 如果是 array. 除去第0个元素以外的其他元素

好了. rule 有了. 他是一个string. 验定参数也有了. 下面看看怎么验证

1. 首先找找. Model 中是否具有 string 同名的方法. 如果有. 调用它进行验证, 如果找不到. 见2
2. 再看看 Validation 对象中看看是否具有相关的方法, 如果有. 进行验证  如果找不到 见3
3. 如果是正则表达式,  验证

验证失败后, 函数还要设置 message: 代码是这样的：

```php
if (!isset($validator['message'])) {
    if (is_string($index)) {
         $validator['message'] = $index;
     } else {
 $validator['message'] = ife(is_numeric($index) && count($ruleSet) > 1, ($index + 1), $message);
}
```

index 有什么用， 这下清楚了吧.

然后调用这个

```php
$this->invalidate($fieldName, $validator['message']);
```

完成一个 field 的验证
