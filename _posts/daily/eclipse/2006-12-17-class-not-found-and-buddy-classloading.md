---
layout: post
title: ClassNotFoundException and Buddy Classloading
categories: eclipse
---

以下情景：

在一个plugin-in中有一个类，其代码如下：

```java
 
package org.bencode.learnrcp.plugin1;  
  
public class SimpleClassLoader {  
  
  public static Class loadClass(String name) throws ClassNotFoundException {  
    return Class.forName(name);  
  }  
}  

```

然后在另一个 plugin-in (rcp application) 中， （这个 plugin-in 依赖于上一个 plugin-in）

有以下代码片段：

```java
 
package org.bencode.learnrcp.plugin2;  
  
public class ClassForLoad {  
  // empty  
}  

```


在某一处：
  

```java
Class c = SimpleClassLoader.loadClass("org.bencode.learnrcp.plugin2.ClassForLoad ");  
```


这时候，运行 plugin2的时候，就会出现 ClassNotFoundException, 原因是 SimpleClassLoader 不会到 plugin2 中找... 至于具体的原因，这里先不说（下次专门讲一下, 我害怕打字，还想玩卡丁）。

这时候，我们可以用 Buddy Classloading 来解决， 它就是为了此类任务而存在的。

两步：
1. 在 plugin 1 的 MANIFEST.MF 中加上如下东东：

```
Eclipse-BuddyPolicy: registered
```

他是说，如果我找不到类，将会请求登记过的plugin的帮助。

2. 在 plugin 2 的 MANIFEST.MF 中加上如下东东：

```
Eclipse-RegisterBuddy: package org.bencode.learnrcp.plugin1
```

他是说，嘿，如果你找不到类，先别出错，试着到我这里看看。
