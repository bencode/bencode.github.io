---
layout: post
title: Node Package的版本
categories: javascript
---

我们开始尝试在正式环境使用node，所以对二方包和三方包的稳定性和一致性会有更高的要求。


node package中包的依赖是通过package.json中的dependencies字段申明的， 其信息包括模块名和版本号（区域）。
但其表达方式可能比较复杂，如  ~1.2.3 或  ^ 1.2.3 或 1.2.x 等，可能有些同学不是非常清楚。

## 1. 关于版本号

node package使用的是一个版本规范：http://semver.org/lang/zh-CN/

总的来说是这样的：

~~~
版本格式：主版本号.次版本号.修订号，版本号递增规则如下：

主版本号：当你做了不兼容的API 修改，
次版本号：当你做了向下兼容的功能性新增，
修订号：当你做了向下兼容的问题修正。
先行版本号及版本编译信息可以加到“主版本号.次版本号.修订号”的后面，作为延伸。
~~~

大家可以看一下这个文章，讲得很清楚


## 2. 关于模块依赖

 node package使用的依赖都是描述在 package.json中的 dependencies属性中

比如:

~~~
{ "dependencies" :
  { "foo" : "1.0.0 - 2.9999.9999"
  , "bar" : ">=1.0.2 <2.1.2"
  , "baz" : ">1.0.2 <=2.3.4"
  , "boo" : "2.0.1"
~~~


大部分的描述都比较直观。 但有些特别语法描述，如果不知道还真不知道。

比如

~~~
{ "dependencies" :
  { "til" : "~1.2", 
    "elf" : “^1.2.3”
~~~

在依赖中，除了可以直接写死版本号外，还可以灵活地指定 版本区域。  

大概像这样

~~~
1.2.3       明确的版本

>1.2.3     表示 大于1.2.3,  相似的有:
<1.2.3
>=1.2.3
<=1.2.3

1.2.3 - 2.3.4   表示  >=1.2.3且<=2.3.4

~1.2.3    表示 >=1.2.3  且 <1.3.0   语义上的意思是：接近1.2.3

^1.2.3  表示  >=1.2.3  且 <2.0.0    语义上的意思是：与1.2.3兼容的版本  

1.2.x  这个好理解， 就是 >=1.2.0 <1.3.0  
1.2.*   和上面一样
~~~

现在应该统统看得懂了，具体的可以参考：
https://www.npmjs.org/doc/misc/semver.html

同时，如果要在代码中进行这样的版本处理，可以直接使用semver这个模块

https://github.com/isaacs/node-semver

## 3. 关于版本的使用

虽然版本号申明方式很灵活，但是在正式的应用中， 我觉得 二方包和三方包，都应使用明确的 版本号，而不是模糊匹配。
这样多人开发时和发布上线时，就可以保证依赖包代码是一致的，可以避免很多问题

## 4. 关于package

关于包的一些资料：

(1) package.json的说明
https://www.npmjs.org/doc/files/package.json.html

(2) 怎么样的东西可以被npm install，即package是什么

https://www.npmjs.org/doc/cli/npm-install.html

(2) 什么样的东西可以被 require，即 module是什么

http://nodejs.org/api/modules.html#modules_modules




