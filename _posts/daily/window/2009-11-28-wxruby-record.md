---
layout: post
title: wxRuby使用记录
categories: window
---

## 1. 使用ruby正常运行， 但exerb导出时，运行失败：

原因： 在wx.rb中有这么一段代码：
 
```ruby
class_files = File.join( File.dirname(__FILE__), 'wx', 'classes', '*.rb')  
Dir.glob(class_files) do | class_file |   
  require 'wx/classes/' + class_file[/\w+\.rb$/]  
end  
```
 
在exerb打包后，这段代码行为发生了变化， classes目录下的文件都没有导入了。
以致运行时失败。
 
解决方法： 可以在程序中require 用到的文件
 
## 2. exerb导出wxruby程序时， 那个图标太难看了，而内置的exy文件可以设置图标，可惜不能设置漂亮的真彩色的icon图标
 
解决方法：直接使用 iconworkshop 打开生成的exe更改icon图标，方便快捷又美观~
 
## 3. 使用多线程 Thread 却得不到运行
 
  因为ruby的“伪线程”，所以在wxRuby中正常情况下时间片都用在事件循环了， “其他线程”没有机会得到运行。
 
解决方法： 可以在 on_init 方法中注册一个 Timer
 
```ruby 
def on_init  
  frame = MainFrame.new  
  frame.show  
  
  Timer.every(100) { Thread.pass }  
    
  return true  
end  
```
 
然后需要适当提高其他线程的 priority, 否则会灰常地慢~~ 
