---
layout: post
title: 为Form中的控件添加漂亮的边框
categories: eclipse
---

今天把机子显示模式调到 "Windows经典"，发现 Form 中的 Text, Table 等控件都没有了边框，变成了空白。

而把创建控件的代码，加上 SWT.BORDER，显示的是三维凹陷的边框，不符合我的要求，我想要 PDE 那样的效果。

查看 Eclipse 源码，发现以下段：

```java
 
public class FormToolkit {  
    ...  
    private class BorderPainter implements PaintListener {  
        public void paintControl(PaintEvent event) {  
            Composite composite = (Composite) event.widget;  
            Control[] children = composite.getChildren();  
            for (int i = 0; i < children.length; i++) {  
                Control c = children[i];  
                ...  
```

这一段是对 composite 中的控件进行边框的绘制，可是对哪些 Composite 进行绘制呢？
于是， 看一下引用 BorderPainter 的地方，见到如下代码：

```java
 
public void paintBordersFor(Composite parent) {  
    // if (borderStyle == SWT.BORDER)  
    // return;  
    if (borderPainter == null)  
        borderPainter = new BorderPainter();  
    parent.addPaintListener(borderPainter);  
}  
```

哈哈， 以后不要忘记要给相应的parent composite调用一下以上方法。

```java
toolkit.paintBordersFor(container);    
```

 
还有 Form 中的 Tree, Table 等控件， 如果不是通过 toolkit 方式构建的，要为它们加上 toolkit.getBorderStyle(), 因为操作系统的差异性，所以 toolkit.getBorderStyle() 对进行了特别处理


```java
// in FormToolkit.class  
       private void initializeBorderStyle() {  
    String osname = System.getProperty("os.name"); //$NON-NLS-1$  
    if (osname.equals("Windows XP")) { //$NON-NLS-1$  
        // Skinned widgets used on XP - check for Windows Classic  
        // If not used, set the style to BORDER  
        RGB rgb = colors.getSystemColor(SWT.COLOR_WIDGET_BACKGROUND);  
        if (rgb.red != 212 && rgb.green != 208 && rgb.blue != 200)  
            borderStyle = SWT.BORDER;  
    } else if (osname.startsWith("Mac")) //$NON-NLS-1$  
        borderStyle = SWT.BORDER;  
}  
```

所以...

```java
tableViewer = new TableViewer(container, 
toolkit.getBorderStyle() | SWT.FULL_SELECTION | SWT.HIDE_SELECTION);  
```
