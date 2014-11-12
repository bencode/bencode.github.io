---
layout: post
title: 代码摘录：关于WorkbenchLabelProvider以及BaseWorkbenchContentProvider
categories: eclipse
---

 
```java

//在这里找 package org.eclipse.ui.model;  

public class WorkbenchLabelProvider extends LabelProvider implements  
        IColorProvider, IFontProvider {   
        // 嘿,  啥都有了  
    
    ...  
  
    public final String getText(Object element) {  
        //query the element for its label  
        IWorkbenchAdapter adapter = getAdapter(element);    
        // 需要一个 IWorkbenchAdapter 呀  
        if (adapter == null) {  
            return "";  
        }  
        String label = adapter.getLabel(element);  
  
        //return the decorated label  
        return decorateText(label, element);  
    }  
  
    protected IWorkbenchAdapter getAdapter(Object element) {  
        if (!(element instanceof IAdaptable)) {   
            // 这里的实现为何是这样？ 我们的Model一定要实现IAdaptable？ 
            // 虽然这样，但我觉得侵入了Model，不好， 
            // 虽然这里可能引入是UI Model，但这却增加了复杂性。  
            // 我觉得这一步实现不好[还好它是方法是保护的，竟味着我们可以在子类中重写它，见下面]。  
            return null;  
        }  
        return (IWorkbenchAdapter) ((IAdaptable) element)  
                .getAdapter(IWorkbenchAdapter.class);  
    }  
  
     
  
    ...  
}  
```

下面看看`IWorkbenchAdapter`, 其实不用看也应该想得到里面有啥（上面有调用过）


```java 
// package org.eclipse.ui.model;  
public interface IWorkbenchAdapter {  
    public Object[] getChildren(Object o);  
  
    public ImageDescriptor getImageDescriptor(Object object);  
  
    public String getLabel(Object o);  
  
    public Object getParent(Object o);  
}  
```

`WorkbenchLabelProvider`当然还有其他方法：`getImage` 等，与`getText()`类似

 
```java
// 还是在这里 package org.eclipse.ui.model;  
public class BaseWorkbenchContentProvider implements ITreeContentProvider {  
    ...  
    public Object[] getChildren(Object element) {    
        // 哈，与上面的getText一样，如法炮制  
        IWorkbenchAdapter adapter = getAdapter(element);  
        if (adapter != null) {  
            return adapter.getChildren(element);  
        }  
        return new Object[0];  
    }  
  
    public Object[] getElements(Object element) {  
        return getChildren(element);  
    }  
    ...  
  
}  
```


上面注释是我不解的地方， 其实...


```java
Platform.getAdapterManager(). registerAdapters(adapterFactory, ...);  
  
// package org.eclipse.core.runtime;  
public interface IAdapterFactory {  
  
    public Object getAdapter(Object adaptableObject, Class adapterType);  
  
    public Class[] getAdapterList();  
}  
```


通过上面。我们可以把**扩展**动态地**插入**

然后可以通过`IAdapterManager#getAdapter(Object adaptable, Class adapterType)`取得需要的东西。 又一个间接层， 这个机制是好的，具有扩展性，而又不具有浸入性。 可是 `WorkbenchLabelProvider` 和 `BaseWorkbenchContentProvider的getAdapter()`方法在发现 Model 没有实现`IAdaptable`的时，直接返回null，而不再问问 `AdapterManager`， 如果问一下，那么将会灵活得多(竟味着功能够动态地插入).

所以，我写下如下代码： 


```java 
public MyWorkbenchLabelProvider extends  WorkbenchLabelProvider {  
    protected IWorkbenchAdapter getAdapter(Object element) {  
        IWorkbenchAdapter adapter = super.etAdapter(element)；  
        if (adapter == null) {  
           adapter = (IWorkbenchAdapter ) Platform.getAdapterManager().getAdapter(element, IWorkbenchAdapter.class);  
        }  
        return adapter;  
    }  
}  
```


当然， `BaseWorkbenchContentProvider`也应该这样。  
我觉得所有使用`IAdaptable`机制的，应该都要这样做。  
而且 `AdapterManager` 似乎做得有点不够，看其代码：

 
```java
// package org.eclipse.core.internal.runtime。AdapterManager  
  
    public Object getAdapter(Object adaptable, Class adapterType) {  
        IAdapterFactory factory = (IAdapterFactory) getFactories(adaptable.getClass()).get(adapterType.getName());  
        Object result = null;  
        if (factory != null)  
            result = factory.getAdapter(adaptable, adapterType);  
        if (result == null && adapterType.isInstance(adaptable))  
            return adaptable;  
        return result;  
    }  
```

最好的是。先看看这个类是否已经实现了`IAdaptable`, 如果是，先问一下嘛，然后再去`Factory`里看看。
