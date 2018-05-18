---
layout: post
title: 《算法导论》读书笔记5(线性时间排序)
categories: algorithms
---

算法导论的第八章是：线性时间排序
 
我们共分析过四个排序算法：插入排序，归并排序，堆排序以及快递排序，它们有一个共同点，就是都是基于比较的，都属于比较排序算法
 
通过决策树模型，可以知道比较排序算法的最坏情况下的下界是：nlog(n)
 
上面的话有点拗口，下面进行简单的分析
 
决策树，是一棵满二叉树，排序的过程就像从根走到叶的过程, 因为不是小于等于就是大于嘛，所以不是向左走，就是向右走，直到走到叶节点，排序完成。 那么比较的次数，在最坏的情况下，不会多于树的高度。
 
n的元素的排序，共有 n! 种 情况， 它们都会出现在决策树的叶子节点上
高度为 h 的二叉对， 叶子数目不会多于 2^h 个
 
因此 n! <= 2^h   ----> h > lg(n!)   后者 相当于 nlg(n)  
 
也就是说不管怎么样的决策树，它的高度不会小于 nlg(n)
 
而一个排序算法，就对应于一棵决策树, 因此在最坏的情况下，它的比较次数 h , 而不管算法设计多么棒 h >= lg(n!)
 
所以堆排序和合并排序都是渐近最优的。
 
快速排序在平均情况下，也是渐近最优的。
 
 
排序也可以不基于比较，因此就没有上述限制
 
计数排序
 
读了这一节，让我想到了《编程珠玑》（不是《编程珠玑2》) 中的一个问题， 大概是这样：
 
系统要对一个文件中的记录进行排序，排序后，输出到另一个文件 。 文件的每个记录都是一个小于7位的数字（背景是美国的电话号码）, 记录不重复，记录数目非常多，大概也是近千万。
 
上面这个过程是一个大系统的一小部分，要求在最好十几秒内就要完成这个过程， 并且大概只有1M的内存空间可以使用。
 
首先， 1千万个数字是放不进1M的， 1M只能放一百万个数字， 所以不能使用普通的内存排序。 可以采用文件归并排序。 但速度肯定达不到要求。
 
但是1千万个(bit)， 差不多是1M多一点， 如果用一个位表示一个数字， 那就有望在1M多一点的内在中保存1千万个数字。
 
该问题最后的解决方案大概是这样的（原文是伪代码，这里使用java实现，并且可以运行，因为可以运行的代码让程序员更兴奋）
 
等等，我们先产生这样的文件，否则又对什么进行操作呢？
 

```java
public void prepareData() throws IOException {  
  long begin = Calendar.getInstance().getTimeInMillis();  
    
  int n = 10000000;   // 7个0;   
  int[] data = new int[n];  // 这大概要用 40M内存, 在我们的机子上米关系  
  for (int i = 0; i < n; i++) {  
    data[i] = i;  
  }  
    
  shuffle(data);  // 打乱它  
    
  Writer writer =  new BufferedWriter(new FileWriter("data.txt"));  
  try {  
    // 选其中的800万个输出  
    for (int i = 0; i < 8000000; i++) {  
      writer.write("" + data[i] + "\n");  
    }  
  } finally {  
    writer.close();  
  }  
    
  long end = Calendar.getInstance().getTimeInMillis();  
  System.out.printf("used: %f(s)", (end - begin) / 1000.0);  
}  
```
 
 
我们首先按顺序产生一千万个数字，然后打乱它，最后输出到文件data.txt
 
其中，shuffle 在算法笔记2中有实现过，用的是ruby, 现在我们用java
 
```java
private void shuffle(int[] data) {  
  Random rand = new Random();  
  int n = data.length;  
  for (int i = 0; i < n; i++) {  
    int j = rand.nextInt(n);  
    //swap  
    int t = data[i];  
    data[i] = data[j];  
    data[j] = t;  
  }  
}  
```
 
 
在我的机子上大概用了9.3s时间， 产生了一个60.1M的文件。
 
下面就是排序并且输出到一个文件啦：）
 
```java
public void hehe() throws IOException {  
  long begin = Calendar.getInstance().getTimeInMillis();  
    
  BitSet bits = new BitSet();  
    
  BufferedReader reader = new BufferedReader(new FileReader("data.txt"));  
  try {  
    String s = null;  
    while ((s = reader.readLine()) != null) {  
      int k = Integer.parseInt(s);  
      bits.set(k);  
    }  
      
  } finally {  
    reader.close();  
  }  
    
  Writer writer =  new BufferedWriter(new FileWriter("out.txt"));  
  try {  
    for (int i = 0, n = bits.length(); i < n; i++) {  
      if (bits.get(i)) {  
        writer.write("" + i + "\n");  
      }  
    }  
  } finally {  
    writer.close();  
  }  
    
  long end = Calendar.getInstance().getTimeInMillis();  
  System.out.printf("used: %f(s)", (end - begin) / 1000.0);  
}  
```
 
 
这在我的机子上用了11.2s, 可以说是读写有多快，它就有多快。
 
 
在上面的例子，我看到了计数排序的影子， 只不过这个 count = 1，所以简单地用位来实现
 
 
计数排序是这样的：
 
```java
int[] countSort(int[] a, int k) {  
  int[] c = new int[k];   // 准备好，对所有k个数字进行计数  
  for (int i = 0; i < c.length; i++) {  
    c[i] = 0;  
  }  
    
  for (int i = 0, n = a.length; i < n; i++) { // 对数组中的数进行计数  
    c[a[i]]++;  
  }  
  // 到这里为止 c[i]  就是 i 这个数字出现的个数  
  
  for (int i = 1; i < c.length; i++) {  
    c[i] = c[i] + c[i - 1];  
  }  
  // 到这里为止 c[i]  就是 < i 数的个数  
  
  int[] b = new int[a.length];  
  for (int i = a.length - 1; i >= 0; i--) {  
    b[c[a[i]] - 1] = a[i];  // 比a[i] 小的数有 c[a[i]] 个, 我们把它放到相应位置   
    c[a[i]]--;  // 计数减一， 这样轮到下一次时，就放到<strong>前面</strong>  
  }  
    
  return b;  
}  
``` 
 
 相应的测试代码是这样的：
 
```java
@Test  
public void testCountSort() {  
  Random rand = new Random();  
    
  int n = 5000000;  
  int k = 10;  
  int[] a = new int[n];  
    
  for (int i = 0; i < n; i++) {  
    a[i] = rand.nextInt(k);  
  }  
    
  assertFalse(isSorted(a));  
  int[] b = countSort(a, k);  
  assertTrue(isSorted(b));  
}  
```
 
 
从代码中可以看出，计数排序的复杂次为 ⊙(n), 是稳定排序，要使用同样多的内存空间
 
趁热打铁， 基数排序
 
直接上代码
 
```java
int[] radixSort(int[] a, int d) { // 数据a中的数字不会长于d位  
  for (int i = 0; i < d; i++) {  
    a = stableSort(a, i); // 从最右边开始，一位一位排  
  }  
  return a;  
}  
```
 
 
stableSort 怎么样呢？ 我们使用上面的计数排序， 稍微进行小调整
 
 
```java
int[] stableSort(int[] a, int k) {  // 对a数组中的数的第k位进行计数排序  
  int[] c = new int[10];  // 数在[0， 10]  
  for (int i = 0; i < c.length; ++i) {  
    c[i] = 0;   
  }  
    
  for (int i = 0, n = a.length; i < n; i++) {  
    int d = getIndex(a[i], k);   
    c[d]++; // 统计第k位数  
  }  
    
  for (int i = 1; i < c.length; i++) {  
    c[i] = c[i] + c[i - 1];  
  }  
    
  int[] b = new int[a.length];  
  for (int i = a.length - 1; i >= 0; i--) {  
    int d = getIndex(a[i], k);  
    b[c[d] - 1] = a[i];  
    c[d]--;  
  }  
    
  return b;  
    
}  
``` 
 
getIndext很简单， 大学C语言经常做的，截取指定位数值
 
```java
int getIndex(int a, int k) {  
  while (a != 0 && k != 0) {  
    a /= 10;  
    k--;  
  }  
  return a % 10;  
}  
```
 
 
最后还是测试，Test Test, 没有Test就是nothing!!
 
```java
@Test  
public void testRadixSort() {  
  Random rand = new Random();  
    
  int[] a = new int[100000];  // 一百万个  
  for (int i = 0; i < a.length; i++) {  
    a[i] = rand.nextInt(10000000);  // 不大于7位数  
  }  
    
  int[] b = radixSort(a, 7);  
  assertTrue(isSorted(b));  
}  
```
 
因为 基数排序 要经过d (数据长度)次排序， 每次使用计数排序， 计数排序的复杂度为 ⊙(n),  d 相当于常量，和N无关， 所以基数排序也是 ⊙(n)

基数排序虽然是线性复杂度， 即对n个数字处理了n次，但是每一次代价都比较高， 而且使用计数排序的基数排序不能进行原地排序，需要更多的内存， 并且快速排序可能更好地利用硬件的缓存， 所以比较起来，像快速排序这些原地排序算法更可取。

但是基数排序有个优点是：它是稳定的(PS: 归并排序也是稳定的）
 
继续打铁， 桶排序
 
把一堆数据快速地扔进有序桶中，再对桶中的数据进行排序...
 
 
```java
float[] bucketSort(float a[]) { // 0 < a[i] < 1，且分布较均匀  
  int n = a.length;  
    
  List[] lists = new List[n]; // 准备好n个桶  
  for (int i = 0; i < n; i++) {  
    lists[i] = new ArrayList();  
  }  
    
  for (int i = 0; i < n; i++) {  // 把每个数据放到相应的桶  
    lists[(int)(n * a[i])].add(a[i]);  
  }  
    
  for (int i = 0; i < n; i++) {  // 现在每个桶中平均有一个数据  
    insertionSort(lists[i]);  // 对它进行一次插入排序  
  }  
    
  float b[] = new float[n];   // 输出  
  int k = 0;  
  for (int i = 0; i < n; i++) {  
    List list = lists[i];  
    for (int j = 0; j < list.size(); j++) {  
      b[k++] = (Float) list.get(j);  
    }  
  }  
    
  return b;  
}  
```
 
 
```java
void insertionSort(List list) {  
  for (int i = 1; i < list.size(); i++) {  
    float t = (Float) list.get(i);  
    int j = i - 1;  
    while (j >= 0 && (Float)list.get(j) > t) {  
      list.set(j + 1, list.get(j));  
      j--;  
    }  
    list.set(j + 1, t);  
  }  
}  
```
 
最后还是测试：
 

```java
@Test  
public void testBucketSort() {  
  Random rand = new Random();  
    
  float[] a = new float[1000];  
  for (int i = 0; i < a.length; i++) {  
    a[i] = rand.nextFloat();  
  }  
    
  float[] b = bucketSort(a);  
  assertTrue(isSorted(b));  
}  
```
 
对了，这里还有一个isSorted
 
原先的方法是针对int[] 的，现在是float[], 所以要重写一个， 仅仅这个参数不一样
 
问： 在java中这样的可以泛形吗？
 
```java
public static boolean isSorted(int[] ary) {  
  for (int i = 0; i < ary.length - 1; i++) {  
    if (ary[i] > ary[i + 1]) {  
      return false;  
    }  
  }  
  return true;  
}  
```
  
```java
public static boolean isSorted(float[] ary) {  
  for (int i = 0; i < ary.length - 1; i++) {  
    if (ary[i] > ary[i + 1]) {  
      return false;  
    }  
  }  
  return true;  
}  
``` 

 对java中的泛形仅仅停留在collection的使用上
 
对于c++，泛形的作用主要在于code generation， 而java中的擦除法泛形更多的功能是type check。
 
对java的泛形没有多作研究，不知道是否这样。
 
其实程序员不是很需要type check的，因为类型错误肯定会在test中给检测出来，而且我们也是思考着写程序的，几乎很少把类型给弄错了。当然强类型在编译优化，效率上肯定有一定的用处。但是我需要敲更少的键盘做更多的事。
 
啊呀，说算法，扯远了。
 
最后还有桶排序的复杂度没有说明。
 
桶排序的其它几个循环很清楚，都是线性的，主要是看下面这个循环:
 
```java
for (int i = 0; i < n; i++) {  // 现在每个桶中平均有一个数据  
  insertionSort(lists[i]);  // 对它进行一次插入排序  
}  
```
 
 
虽然 insertionSort 是平方复杂度的， 但是 lists[i] 的数据是不会随着 n 的增长而增长的。 如果有n桶，桶中平均只有一个数。
 
所以上面这个循环也是线性复杂度的
 
所以桶排序的复杂度也是线性的
