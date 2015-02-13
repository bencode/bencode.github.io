---
layout: post
title: wxWidgets是个好东西
categories: window
---

最近一个工具，由于是工具，本来是用SDK编写的，只是功能完成后，对界面不满意，但是苦于手头可用的东东有限。。。

MFC？这玩意儿，我从大三开始研究，把各类宏，消息映射机理，搞得很清楚，看了《深入浅出MFC》不止两次，还搞不出东西，于是又看了《Programming Windows With MFC》终于好像能搞出一些DEMO， 后来碰到一聊友，说“把MFC扔进垃圾堆，永远不要碰这种东西……”

VCL！ 是个好东西，虽然不会Delphi，但C++ Builder也很好用，虽然对C++改了些语法和语意，嘿嘿。 Chuck 和 Anders这两个牛人。 

SWT/JFace： 可以说这一年多一直在进行着基于Eclipse的RCP开发，所以对SWT/JFace也很熟悉，而且Java语法优美简洁，比起C++，写起来轻松多了（不仅是生理上的，而且是心理上的： 这个 new 要不要 delete，不行，应该用RAII， 参数不能是直接是类型，应该改成const引用以避免拷贝…… 哇，不想这些了，自然轻松和愉快）  

所以如果对方机子上有JVM，或者允许安装JVM的话， 我会选择SWT/JFace

当然，如果对于大一些的窗口程序，使用 Eclipse RCP 简直酷B了！

偶有一次，在使用Ruby，遇见 wxRuby，这东东的文档中提到了 wxWidgets， 于是就这样结识了它（本人我是古墓派）

于是立马下载，安装，编译，哇噻！ 还有许许多多的 samplesssssssssss。除了自带的帮助，我还找到了一本由 Julian Smart(我以后就给我儿子取名叫  "X有钱") 亲自写的《Cross-Platform GUI Programming with wxWidgets》...

然后我把我那个类似于资源管理器的小工具用 wxWidgets 重新写过。 果然不错

我的手头又多了一样武器~~~
