---
layout: post
title: TableViewer, TreeViewer双击编辑
categories: eclipse
---


在TreeViewer或TableViewer中，可用CellEditor结合CellModifier可以很实现表格的编辑功能，但是默认的是单击，就会打开编辑区域。有时候我们会需要双击进行（或者其他），于是我写了一个`DoubleCellModifier`，只要让你的`CellModifier`继承它，就可以很方便实现双击编辑。

具体代码如下：
 

```java
package com.longthsoft.rcppart.ui;  
  
import org.eclipse.jface.viewers.ICellModifier;  
import org.eclipse.jface.viewers.TableViewer;  
import org.eclipse.jface.viewers.TreeViewer;  
import org.eclipse.swt.events.MouseAdapter;  
import org.eclipse.swt.events.MouseEvent;  
import org.eclipse.swt.widgets.Item;  
  
public abstract class DoubleClickCellModifier implements ICellModifier {  
     
    private boolean doubleClick;  
    private Object element;  
    private String property;  
     
    public DoubleClickCellModifier(final TableViewer tableViewer) {  
        tableViewer.getTable().addMouseListener(new MouseAdapter() {  
            @Override  
            public void mouseDoubleClick(MouseEvent e) {  
                if (allowModify(element, property)) {  
                    int column = UIUtil.getPropertyColumnIndex(tableViewer, property);  
                    doubleClick = true;  
                    tableViewer.editElement(element, column);  
                    doubleClick = false;  
                }  
            }  
        });  
    }  
     
    public DoubleClickCellModifier(final TreeViewer treeViewer) {  
        treeViewer.getTree().addMouseListener(new MouseAdapter() {  
            public void mouseDoubleClick(MouseEvent e) {  
                if (allowModify(element, property)) {  
                    int column =UIUtil.getPropertyColumnIndex(treeViewer, property);  
                    doubleClick = true;  
                    treeViewer.editElement(element, column);  
                    doubleClick = false;  
                }  
            }  
        });  
    }  
     
    public boolean canModify(Object element, String property) {  
        this.element = element;  
        this.property = property;  
        if (doubleClick) {  
            return true;  
        } else {  
            return false;  
        }  
    }  
     
    public void modify(Object element, String property, Object value) {  
        if (element instanceof Item) {  
            element = ((Item) element).getData();  
        }  
        doModify(element, property, value);  
    }  
     
    public boolean allowModify(Object element, String property) {  
        return true;  
    }  
     
    public abstract void doModify(Object element, String property, Object value);  
} 
```
