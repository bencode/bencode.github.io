---
layout: post
title: 《算法导论》读书笔记7(散列表)
categories: algorithms
---

《算法导论》第三部分 数据结构 略过栈 队列 链表，我们到了 散列表
 
散列表是最常用的数据结构之一，特别是 ruby js等动态语言在语法层次上对它进行了支持。只是在java中，有那么点点绕(每次使用的时候，心里会疙瘩一下，不知道你们有没有这种感觉)。
 
本章真是纠结，因为看得懂的以前都看过，不懂的现在还是看不懂。 还好看不懂的部分都是加星号的。
 
 
散列表是这样一个东西：它能以key为索引保存东西， 然后在需要的时候嗖的一下就能找出来，灰常地快：）
 

```java
@Test  
public void test() {  
    HashTable ht = new HashTable();  
      
    Object o1 = new Object();  
    ht.put("o1", o1);  
      
    Object o2 = new Object();  
    ht.put("o2", o2);  
      
    assertEquals(o1, ht.get("o1"));  
    assertEquals(o2, ht.get("o2"));  
}  
```
 
 get方法要在常量时间内找到需要的东西。O(1)  <--- 要这样的复杂度
 
先不管这些，但至少HashTable看起来像这样：
 
```java
public class HashTable {  
      
    public void put(String key, Object value) {  
        //...  
    }  
      
    public Object get(String key) {  
        //...  
        return null;  
    }  
}  
```
 
上面的代码当然是通不过测试的(PS: 请先忘记`java.util.HashTable`)
 
要想get足够快，那么最好是跟据 key 直接计算出存储位置， 然后就能一下子找到啦。
 
差不多像这样:
 

```java
public class HashTable {  
      
    private Object[] table = new Object[1000];  
      
    public void put(String key, Object value) {  
        int hash = hash(key.hashCode());  
        if (table[hash] == null) {  
            table[hash] = value;  
        } else{  
            throw new RuntimeException("撞车啦，怎么办?");  
        }  
    }  
      
    public Object get(String key) {  
        int hash = hash(key.hashCode());  
        return table[hash];  
    }  
      
    private int hash(int hashCode) {  
        return -1; // 这里需要返回一个数 [0, table.length - 1]  
    }  
}  
```

 
运行测试，数组越界， 因为我们还未实现 hash 这个方法。
 
hash 的作用是把关键字等可能地散列到 table 中去
 
有除法散列，乘法散列，等等。
 
 
先试一个除法散列：
 
```java
private int hash(int hashCode) {  
    int capacity = table.length;  
    return hashCode % capacity;  
}  
```
 
capacity 不应该是 2 的幂， 否则的话值为hashCode的低 k 位， 高位就会浪费掉，可能会造成很多碰撞
 
可以选择2的整数幂不大接近的质数。
 
 
现在运行测试，是通过滴：）
 
但是等等， 有时候我们需要这样：
 
```java
@Test  
public void test2() {  
    HashTable ht = new HashTable();  
      
    Object o1 = new Object();  
    ht.put("o1", o1);  
      
    Object anotherO1 = new Object();  
    ht.put("o1", anotherO1);    // 更新  
    assertEquals(anotherO1, ht.get("o1"));  
}  
```
  
 
我们需要重构代码，把key也给保存起来。
 
首先添加一个结构， 保存key 和value
 

```java
public class HashTable {  
      
    public static  class Entry {  
        private String key;  
        private Object value;  
          
        public Entry(String key, Object value) {  
            this.key = key;  
            this.value = value;  
        }  
          
        public String getKey() {  
            return key;  
        }  
        public Object getValue() {  
            return value;  
        }  
    }  
      
    private Entry[] table = new Entry[1000];  // 原来的Object[] 改成 Entry[]  
```
 
重构put
 
 
```java
public void put(String key, Object value) {  
    int hash = hash(key.hashCode());  
    if (table[hash] == null || table[hash].getKey().equals(key)) {  
        table[hash] = new Entry(key, value);  
    } else{  
        throw new RuntimeException("撞车啦，怎么办?");  
    }  
}  
```
 
重构get
 

```java
public Object get(String key) {  
    int hash = hash(key.hashCode());  
    Entry entry = table[hash];  
    return entry == null ? null : entry.getValue();   
}  
```
 
 可以看到，测试又通过了：）
 
再看乘法散列
 

```java
private int hash(int hashCode) {  
    int capacity = table.length;  
    double a = 0.6180334;  // 万能的黄金分割  
    return (int) (((hashCode * a) % 1) * capacity);  
}  
```
 
用常数(A) 乘hashCode  取小数 再乘capacity
 
Knuth认为 黄金分割数 是比较理想的值（(根号5 - 1) / 2 ~ 0.618), 股民朋友们一定认识
 
乘法散列 的优点是：
 
对 capacity 没有什么特别的要求， 一般选择它为 2 的整数幂。
 
因为这样可以使用移位代替乘法计算。
 
然后黄金分割数 A 如果可以表示成 2654435769  / (2 ^32)
 
那就可以简化成：

```
((hashCode * 2654435769) 
    & ((1 << 32) - 1) )   // 只保留 32 位
 >> (32 - p)
```
 
重购代码试试看：
 
首先，数组空间大小为 2 ^ p
 

```java
private int p = 10;  
private Entry[] table = new Entry[1 << p];  
```
 
然后：
 

```java
private int hash(int hashCode) {  
    long k = 2654435769L;  
    return (int)(((k * hashCode) & ((1L << 32) - 1)) >> (32 - p));  
}  
```
 
测试还是通过滴。
 
下面， 让我们加多一点元素，搞坏它。


```java
@Test  
public void test3() {  
    HashTable ht = new HashTable();  
      
    for (int i = 0; i < 1000; i++) {  
        Object o = new Object();  
        ht.put("key" + i, o);  
        assertEquals(o, ht.get("key" + i));  
        System.out.println("Ok: " + i);  
    }  
}  
```
  
运行测试，失败， 可以看到控制台只输出到 108
 
`RuntimeException`,   撞车了怎么办？
 
可以采用链接法，开放寻址法搞定
 
先来 链接法
 
首先重构Entry, 把自己串起来
 

```java
public static class Entry {  
    private String key;  
    private Object value;  
    private Entry next;  
      
    public Entry(String key, Object value) {  
        this(key, value, null);  
    }  
    public Entry(String key, Object value, Entry next) {  
        this.key = key;  
        this.value = value;  
        this.next = next;  
    }  
      
    public String getKey() {  
        return key;  
    }  
      
    public Object getValue() {  
        return value;  
    }  
    public void setValue(Object value) {  
        this.value = value;  
    }  
      
    public Entry getNext() {  
        return next;  
    }  
}  
```
 
同时也添加了一个 setValue 方法， 这样更容易在链表中“更新元素”
 
然后重构put
 

```java
public void put(String key, Object value) {  
    int hash = hash(key.hashCode());  
    Entry entry = table[hash];  
      
    if (entry == null) { // 位置没被使用过， 直接用  
        table[hash] = new Entry(key, value);  
        return;  
    }  
    for (Entry o = entry; o != null; o = o.getNext()) {  
        if (o.getKey().equals(key)) {  // 看看key节点是否存在， 如果是，就更新它  
            o.setValue(value);  
            return;  
        }  
    }  
    table[hash] = new Entry(key, value, entry);  // 这里我们串起来  
}  
```
 
 
可以看到，测试正常运行：）
 
但是随着散列表中的元素越来越多，碰撞机率也越来越大，最好当元素数量达到一定量时，自动扩充容量，这样才能保证其优异的查找性能。
 
但是我们先看看，现在的散列表， 运行test3时，碰撞几率是多少。
 
为此，我们重构, 发生碰撞时， 统计次数。
 

```java
private int size = 0;  // 统计表中元素个数  
private int collideCount = 0;  // 统计碰撞次数  
  
public int getSize() {  
    return size;  
}  
public float getCollideRate() {  
    return size > 0 ? ((float) collideCount) / size : 0;  
}  
```
 
```java
public void put(String key, Object value) {  
        int hash = hash(key.hashCode());  
        Entry entry = table[hash];  
          
        if (entry == null) {  
            table[hash] = new Entry(key, value);  
            size++;  // 这里  
            return;  
        }  
        collideCount++;  // 这里  
        for (Entry o = entry; o != null; o = o.getNext()) {  
            if (o.getKey().equals(key)) {  
                o.setValue(value);  
                return;  
            }  
        }  
        table[hash] = new Entry(key, value, entry);  
        size++; // 还有这  
    }  
```
 
测试：
 

```java
@Test  
public void test4() {  
    HashTable ht = new HashTable();  
      
    for (int i = 0; i < 1000; i++) {  
        ht.put("key" + i, new Object());  
    }  
    System.out.println(ht.getCollideRate());  
}  
```
 
输出：0.309
 
总的容量为 1024, 有1000个元素， 其中309个是发生碰撞。事故挺严重的。
 
 
下面我们重构HashTable类， 让其每次达到容量的 0.75(装载因子) 就扩充容量：）
 
```java
private int p = 4;  
private Entry[] table = new Entry[1 << p];  
private float loadFactor = 0.75f;  
```
 
首先， 我们的初始化容量为 16个(1 << 4)， 然后 load factor 为0.75
 

```java
public void put(String key, Object value) {  
    if (table.length * loadFactor < size) {  
        resize();  
    }  
```
 
然后在put 前检查一下, 如有必要 resize
 
 
```java
private void resize() {  
    Entry[] old = table;  
      
    p += 1;  
    table = new Entry[1 << p];  
    size = 0;  
    collideCount = 0;  
      
    for (int i = 0; i < old.length; i++) {  
        Entry entry = old[i];  
        while (entry != null) {  
            put(entry.getKey(), entry.getValue());  
            entry = entry.getNext();  
        }  
    }  
}  
```
 
 
写个测试：
 

```java
@Test  
public void test5() {  
    HashTable ht = new HashTable();  
      
    for (int i = 0; i < 1000; i++) {  
        Object o = new Object();  
        ht.put("key" + i, o);  
        assertEquals(o, ht.get("key" + i));  
    }  
    System.out.println(ht.getSize());  
    assertTrue(ht.getSize() == 1000);  
    System.out.println(ht.getCollideRate());  
}  
```
 
这个时候，同样是添加到1000个， loadFactor 此时为 0.08
 
我们的散列表初始大小为16,  添加到1000个，要进行若干次 resize, resize开销比较大。
 
我们可以重构代码， 构造函数中指定容量大小，以避免不必要的resize开销。
 
但这里不做了，因为现在只是为了说明算法， 但是使用 java.util.HashMap时，就晓得了。
 
 
解决碰撞还有开放寻址法
 
也是灰常容易滴， 我们添加两个方法， put2, 和 get2， 实现看看。
 
使用最简单的 线性探查
 

```java
public void put2(String key, Object value) {  
    if (table.length * loadFactor < size) {  
        resize();  
    }  
      
    int hash = hash(key.hashCode());  
    Entry entry = table[hash];  
      
    int nextHash = hash;  
    while (entry != null) {  
        if (entry.getKey().equals(key)) {  
            entry.setValue(value);  
            return;  
        }  
        nextHash = (nextHash + 1) % table.length;  // 看看下一个位置  
        entry = table[nextHash];  
    }  
    table[nextHash] = new Entry(key, value);  
    size++;  
      
    if (hash != nextHash) {  
        collideCount++;  
    }  
}  
```
 
```java
public Object get2(String key) {  
    int hash = hash(key.hashCode());  
    Entry entry = table[hash];  
    while (entry != null) {  
        if (entry.getKey().equals(key)) {  
            return entry.getValue();  
        }  
        hash = (hash + 1) % table.length;  
        entry = table[hash];  
    }  
    return null;  
}  
```
 
同样，写一个测试：
 
```java
@Test  
public void test6() {  
    HashTable ht = new HashTable();  
      
    for (int i = 0; i < 1000; i++) {  
        Object o = new Object();  
        ht.put2("key" + i, o);  
        assertEquals(o, ht.get2("key" + i));  
    }  
    System.out.println(ht.getSize());  
    assertTrue(ht.getSize() == 1000);  
    System.out.println(ht.getCollideRate());  
}  
```
 
线性探查比较容易实现， 但是容易造成“堆在一起”的问题， 书中称为：一次群集
 
可以采用二次探查， 或双重散列，更好地避免这种现象。
 

下面看看`java.util.HashMap`的实现，更好地了解散列表。
 
先看 put:
 
```java
public V put(K key, V value) {  
    if (key == null)  // null 也可以为key  
        return putForNullKey(value);  
    int hash = hash(key.hashCode()); // 关心的地方  
    int i = indexFor(hash, table.length); // 关心的地方  
    for (Entry<K, V> e = table[i]; e != null; e = e.next) {  
        Object k;  
        if (e.hash == hash && ((k = e.key) == key || key.equals(k))) {  
            V oldValue = e.value;  
            e.value = value;  
            e.recordAccess(this);  
            return oldValue;  
        }  
    }  
  
    modCount++;  
    addEntry(hash, key, value, i); // 关心的地方  
    return null;  
}  
```
 
代码中 hash 和 indexFor addEntry 是我们关心的地方。
 
此外： HashMap 允许使用值为 null 的key
 
有一个 if 语句：
 
```java
if (e.hash == hash && ((k = e.key) == key || key.equals(k))) {    
```
 
先看看 hash值是否相等， 再判断equals
 
这也给出了我们重写equals和 hash的原则： 如果你重写了equals, 那么你一定要重写 hashCode, 如果两个对象equals，那么hashCode也一定要相等, 否则在HashMap等容器中将不能正确工作。参看《Effective Java》
 
 
再来看看 hash 和 indexFor  (中文注释是我加的)
 
```java
/** 
  * Applies a supplemental hash function to a given hashCode, which 
  * defends against poor quality hash functions.  This is critical 
  * <strong>because HashMap uses power-of-two length hash tables</strong>, that 
  * otherwise encounter collisions for hashCodes that do not differ 
  * in lower bits. Note: Null keys always map to hash 0, thus index 0. 
  */  
 static int hash(int h) {  
     // This function ensures that hashCodes that differ only by  
     // constant multiples at each bit position have a bounded  
     // number of collisions (approximately 8 at default load factor).  
     h ^= (h >>> 20) ^ (h >>> 12);  
     return h ^ (h >>> 7) ^ (h >>> 4);  
 }  
  
 /** 
  * Returns index for hash code h. 
  */  
 static int indexFor(int h, int length) {  
     return h & (length-1);  
 }  
```
 
hash 根据 原hashCode产生更好的散列值， 因为table的容量大小刚好为2的整数幂， 所以必须这样做，否则hash code的高位将浪费(取模时) --- 见上面 除法散列
 
indexFor： 等于 h % length,
 
所以，HashMap 采用 改进的除法散列
再看看 addEntry
 
```java
void addEntry(int hash, K key, V value, int bucketIndex) {  
    Entry<K, V> e = table[bucketIndex];  
    table[bucketIndex] = new Entry<K, V>(hash, key, value, e);  
    if (size++ >= threshold)  
        resize(2 * table.length);  
}  
```
 
table 也成倍扩展的
