---
layout: post
title: 修改mysql root密码
categories: essay
---


```
sudo mysqld_safe --skip-grant-tables

$ mysql -u root
mysql> USE mysql;
mysql> UPDATE user SET password=PASSWORD("NEWPASSWORD") WHERE User='root';
mysql> FLUSH PRIVILEGES;
mysql> quit
Change out NEWPASSWORD with whatever password you want. Should be all set!

Update: As of MySQL 5.7, the password field has been renamed authentication_string. When changing the password, use the following query to change the password. All other commands remain the same:

mysql> UPDATE user SET authentication_string=PASSWORD("NEWPASSWORD") WHERE User='root';
```

[refer](http://stackoverflow.com/questions/6474775/setting-the-mysql-root-user-password-on-os-x)
