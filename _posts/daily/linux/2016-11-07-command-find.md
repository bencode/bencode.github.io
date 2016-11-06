---
layout: post
title: 一天一个Linux命令 - find
categories: linux
---

## 根据名称查找，支持通配符

```
find . -name 'yarn.*'
```

## 过滤无权访问

```
find . -name 'yarn.*' 2>/dev/null
```

## 根据时间查文件


### 两分钟内访问过的文件

```
find /var -amin -2
```


### 过去60天未访问过的文件

```
find /Users/bencode -atime +60
```


## 指定查找类型

```
find . -type d -name 'a*'
```

## 查找指定权限文件

```
find . -perm 750
```

## 查找指定用户文件

```
find /var -user francois -print
```

## 对查找结果执行命令

```
find . -d 1 -name '*.log.*' | xargs rm -f
```

## 对查找结果取反

```
find . ! -name '*.js'
```
