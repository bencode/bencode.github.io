---
layout: post
title: 让JFace Dialog底部的按扭居中
categories: eclipse
---


查Eclipse源码可以看到： 


``` java
// in Dialog.class  
protected Control createButtonBar(Composite parent) {  
  ...  
  
  GridData data = new GridData(GridData.HORIZONTAL_ALIGN_END  
        | GridData.VERTICAL_ALIGN_CENTER);  
  composite.setLayoutData(data);  
  composite.setFont(parent.getFont());  
     
  / Add the buttons to the button bar.  
  createButtonsForButtonBar(composite);  
}  
```

于是，我应该在自己的Dialog类中， 这样:

```java 
@Override  
protected void createButtonsForButtonBar(Composite parent) {  
  GridData gridData = (GridData) parent.getLayoutData();  
  gridData.horizontalAlignment = SWT.CENTER;  
   
  ...  
}  
```
