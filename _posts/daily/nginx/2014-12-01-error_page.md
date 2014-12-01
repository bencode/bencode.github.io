---
layout: post
title: 配置error_page
categories: nginx
---

官网文档：[查看](http://nginx.org/en/docs/http/ngx_http_core_module.html#error_page)


注意点是，如果error_page指向的页面是一个远程地址，如http://demo.com/errorpage.html
那默认页面会进行302跳转，而不管原来的状态码。

如

```
error_page 404      http://demo.com/404.html;
```

则nginx会302到以上页面，这样会对SEO有影响，我们希望实现对页面进行代理请求

此时可以配合proxy-pass做一个中间层

```
location / {
    error_page 404 /404;
}

location /404 {
    proxy_pass http://demo.com/404.html;
}
```

文档中有这样的例子，但是我试过无效果：

```
location / {
    error_page 404 = @fallback;
}

location @fallback {
    proxy_pass http://backend;
}
```

会出现指令出错。

`nginx: [emerg] "proxy_pass" cannot have URI part in location given by regular expression, or inside named location, or inside "if" statement, or inside "limit_except" block in`
