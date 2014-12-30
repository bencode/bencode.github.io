---
layout: post
title: git最佳实践
categories: git
---

## 关于提交

### 1. 经常提交，并让每个提交尽量小，提交的内容只包含**相关**改动。

  比如2个bug，一次性改完，那也要分两次提交，可以配合使用stash来达到目的。

### 2. 提交时**必须**带上相应的描述，格式如下

```
标签: 简短描述

这里是提交的详细描述
可以说明为什么要这么修改，是如何解决问题的
以及这些变化可能会影响到的点
这些信息用于方便review，很可能下一个看的就是自己

```

### 3. 关于简短描述
  只用一句话说明本次所作的提交  
  如果一句话说不清楚，那有可能这个提交得拆分成多次提交，这有点像方法重构。  
  很多文章中建议这里不要超过50个字符，而且那指的是英文，汉字表达能力更足，应该20个字就搞定了。  


### 4. 关于类别
这一点是我使用过程中感觉很有用的一点，不过对于不同类型的仓库，可能会定义不同的tag。我常用的tag有

* Fix: 修改了某个bug
* Add: 添加新特性
* Change: 修改某些特性
* Update: 更新依赖库造成的修改
* Remove: 去掉了某些特性
* Refactor: 重构代码(指的是不修改代码功能，优化代码结构)

其它不同的仓库有不同的规范，比如nodejs源码的提交，往往会带上修改的包名，比如src, test等。  
强列建议看看一些优秀仓库的提交log, 比如git本身就是很好的例子


### 5. 关于-m参数
  为了能让提交时不仅仅出现“fix”, "ci"等无用注释，建议**永远不要带上 -m 参数**

  使用 git commit [-a] <enter>, 系统会弹出编辑器让你写。 所以建议好好配置一下git的外置编辑器

### 6. 描述后面的空行很重要，它会一些自动化脚本提供支持


### 相关文档

- https://ruby-china.org/topics/15737
- http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html
- http://web-design-weekly.com/2013/09/01/a-better-git-commit/
- http://ablogaboutcode.com/2011/03/23/proper-git-commit-messages-and-an-elegant-git-history/
- https://github.com/erlang/otp/wiki/Writing-good-commit-messages
- http://robots.thoughtbot.com/5-useful-tips-for-a-better-commit-message


## 关于分支


