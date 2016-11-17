---
layout: post
title: Linux命令学习记录 - 文件查找
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
find . -d 1 -name '*.log.*' -X | xargs rm -f
```

## 对查找结果取反

```
find . ! -name '*.js'
```


## 参数


### -E

正则式扩展模式

### -H, -L

软链接相关，-H不是很明白， -L会扫描软链接指向的目录


## primaries


有数字的primaries可以带前缀+和-，+n表示`more than n`, -n表示`less than n`。


### 文件时间


格式有：smhdw

```
-Btime    # innode创建时间
-atime    # 访问时间
-ctime    # 修改文件状态时间
-mtime    # 修改文件内容时间
```

找出3天内改动过的文件

```
find . -mtime -3d
```


## 文件类型

```
-type [bcdflps]
```


## 文件大小

-size n[ckMGTP]


## 组和用户


```
-group name
-user name
```


### -delete, -ls

删除找到的文件  
列出找到的文件信息


### -empty

找出空目录


### 目录深度

```
-depth n
-maxdepth n
-mindepth n
```


## 权限

```
-perm 755
```

## 条件

```
-and
-or
-not
!
```

多条件可以组合


### exec

```
--exec
--execdir   # 执行时会切换目录到当前文件
```

### flags

+flags 全部都要满足
-flags 只要一个满足


## -print0
## -xdev
