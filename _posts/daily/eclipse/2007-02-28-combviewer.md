---
layout: post
title: 照着葫芦画，CComboViewer
categories: eclipse
---


我的代码中有一个 ComboViewer, 不过在Window 2000，Form 中，样式有点难看，有讨厌的三维边框。
而 FormToolkit 只对 CCombo 控件 进行细边框绘制（FormToolkit.paintBorderFor(...)）
所以我依照 ComboViewer “抄” 了一个 CComboViewer。 


```java 
package com.longthsoft.rcppart.ui.parts;  
  
import org.eclipse.jface.viewers.AbstractListViewer;  
import org.eclipse.swt.SWT;  
import org.eclipse.swt.custom.CCombo;  
import org.eclipse.swt.widgets.Composite;  
import org.eclipse.swt.widgets.Control;  
  
public class CComboViewer extends AbstractListViewer {  
  
    private CCombo combo;  
  
    public CComboViewer(Composite parent) {  
        this(parent, SWT.READ_ONLY | SWT.BORDER);  
    }  
  
    public CComboViewer(Composite parent, int style) {  
        this(new CCombo(parent, style));  
    }  
  
    public CComboViewer(CCombo list) {  
        this.combo = list;  
        hookControl(list);  
    }  
  
    public CCombo getCCombo() {  
        return combo;  
    }  
  
    @Override  
    public Control getControl() {  
        return combo;  
    }  
  
    @Override  
    protected void listAdd(String string, int index) {  
        combo.add(string, index);  
    }  
  
    @Override  
    protected void listDeselectAll() {  
        combo.deselectAll();  
        combo.clearSelection();  
    }  
  
    @Override  
    protected int listGetItemCount() {  
        return combo.getItemCount();  
    }  
  
    @Override  
    protected int[] listGetSelectionIndices() {  
        return new int[] { combo.getSelectionIndex() };  
    }  
  
    @Override  
    protected void listRemove(int index) {  
        combo.remove(index);  
    }  
  
    @Override  
    protected void listRemoveAll() {  
        combo.removeAll();  
    }  
  
    @Override  
    protected void listSetItem(int index, String string) {  
        combo.setItem(index, string);  
    }  
  
    @Override  
    protected void listSetItems(String[] labels) {  
        combo.setItems(labels);  
    }  
  
    @Override  
    protected void listSetSelection(int[] ixs) {  
        for (int idx = 0; idx < ixs.length; idx++) {  
            combo.select(ixs[idx]);  
        }  
    }  
  
    @Override  
    protected void listShowSelection() {  
        return;  
    }  
  
    @Override  
    public void reveal(Object element) {  
        return;  
    }  
  
}  
```
