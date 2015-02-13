昨天一朋友找工作, 碰到两道算法笔试题, 都是当于链表操作的.

原题具体的还原不过来了, 不过大致是:

## 1. 有一单链表, 找出最后第m个节点.

 昨天看到问题时,想到了小学应用题: 

汽车过山洞, 假如这个汽车开着开着, 等到车头刚要出山洞, 车尾离山洞出口也有一段距离嘛...

这样, 这个题方法出来了

```c 
Node* FindLastNode(Node* root, int m) {  
    Node* head = root;  
    Node* tail = root;  
  
    // 开始时,大概是这样  
    //           |---------------------|  这个是山洞  
    //           >>               这个是车车? 哦, 是小蛇, 身体盘在一起...  
      
    // 然后往前爬  
    for (int i = 0; i < m; ++i) {  
        head = head->next;  
    }  
  
    // 此时  
    //           |---------------------|  这个是山洞  
    //           >-------->  
  
    // 一起前进吧  
    while (head->next) {  
        head = head->next;  
        tail = tail->next;  
    }  
  
    // 此时  
    //           |---------------------|  这个是山洞  
    //                        >-------->  
  
    return tail;  
}  
```

当然,特殊情况要考虑, 不过那....


## 2.  有一单链表, 判断是否存在环

 
有环? 走着走着, 却突然发现, 怎么也走不完, 可是这要走到什么时候? 此法不通

可是怎么也想不出好办法. 只有一个笨方法:

看看现在走的路, 是不是已走过...

```c 
bool HasCircle(Node* root) {  
    Node* cur = root;  
    while (cur->next) { // 1 号走到一个站， 等  
        // 派出2号，开始走， 看是否更快地和1号相遇  
        for (Node* other = root; other->next != cur; other = other->next) {  
            if (cur->next == other) {     
                return true;    // 2号提前赶到， 1 号走冤枉路了  
            }  
        }  
        cur = cur->next;      
    }  
    return false;  
}  

```

对于2, 不知道有没有更好的办法?
