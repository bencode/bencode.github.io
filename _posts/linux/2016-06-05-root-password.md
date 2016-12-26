---
layout: post
title: 修改mysql root密码
categories: essay
---


```
sudo mysqld_safe --skip-grant-tables

$ mysql -u root
mysql> USE mysql;
mysql> UPDATE user SET authentication_string=PASSWORD("NEWPASSWORD") WHERE User='root';
mysql> FLUSH PRIVILEGES;
mysql> quit
```

[refer](http://stackoverflow.com/questions/6474775/setting-the-mysql-root-user-password-on-os-x)
