---
layout: post
title: 《算法导论》读书笔记4 (快速排序)
categories: algorithms
---


Java代码 
敢取这个名字，应该很快！  
  
直切主题， 它的算法像这样：  
 

```java
void quickSort(int[] a, int low, int high) {  
    if (low >= high) {  
        return;  
    }  
      
    int mid = partition(a, low, high);  // 先做一个划分, mid左边的元素都比a[mid]小...  
      
    quickSort(a, low, mid - 1); // 排左边的元素  
    quickSort(a, mid + 1, high);    // 排右边的元素  
}  
```
 
简单，容易理解，高效！
 
关键是怎么划分。
 
先来一个容易理解的。
 
```java
int partition(int[] a, int low, int high) {  
    int x = a[low]; // 就以第一个元素为界，对 [low, high] 内的元素进行划分  
    int mid = low;  // mid及其左边的元素都 <= x  
    for (int i = low + 1; i <= high; i++) {  //挑出比 x 小的元素， 放到 mid中  
        if (a[i] < x) {  
            swap(a, ++mid, i);  
        }  
    }  
    // 到这里为止， [low + 1, mid] <= x <= [mid + 1, high]  
    swap(a, low, mid);  // 把 x 放到<strong>"中间"</strong>来  
      
    return mid;  
}  
```
 
 完成了， 然后立马写一段代码进行无情的测试， 我们排序一万次。
 
```java
@Test  
public void testQuickSort() {  
    for (int i = 0; i < 10000; i++) {  
        int[] array = genRandAry(i);  
        quickSort(array);  
        assertTrue(isSorted(array));  
    }  
}  
```
 
green bar!
 
 
当年Hoare设计的quicksort 的划分，不是这样滴。 比上面的有意思一点点
 
```java
int partition2(int[] a, int low, int high) {  
    int x = a[low]; // 同样，暂时以第一个元素进行划分  
    int i = low;  
    int j = high + 1;  
    while (true) { // 我们从左向右找到一个比 x 大数， 再从右向左找到一个比 x 小的数，交换  
        do {  
            j--;  
        } while (i < j && a[j] >= x); // 先从右向左找到一个比 x 小的数  
          
        do { // 再找一个比x 大的数， 这里不检查上一步有没找到，因为如果没找到 将会使i > j  
            i++;  
        } while (i < j && a[i] <= x);    
          
        if (i < j) { // 都找到了，就交换, 此时 [low + 1, i] <= x <= [j, high]  
            swap(a, i, j);   
        } else {  
            break;  
        }  
    }  
    if (i > j) {  
        i--;  
    }  
    swap(a, low, i);  
    return i;  
}  
```
 
partition2比partition 代码长了好多，比较次数一样，因为所有元素都要和 x 比较一次。 不过 partition2 交换次数会比partition 少，因为它只做“必要”的交换， 而 partition 中，只要比 x小的都进行一次swap
 
下面来看复杂度。

我们来重写quickSort,计算比较次数，现在我们不关心数组

 
```java
int quickSort2(int n) {  
    if (n <= 1) {  
        return 0;   // 1个以下，不用排  
    }  
  
    int times = 0;  // 比较次数  
    times += n - 1; // partiation 需要进行 n - 1 次比较  
  
          
    // partiation 后成这样： [..k个..][x][n - k - 1] 个  
    times += quickSort2(k);  
    times += quickSort2(n - k - 1);   
      
    return times;  
}  
```
 
 
 1.在最优情况下， partiation 每次都划分得很均匀
 
   此时：T(n) = 2 T(n / 2) + (n - 1) ; // 在笔记1中， 我们知道，这个解是 nlog(n)
  所以快速排序的最好情况是 nlog(n)
 
2.在最坏情况下， partiation 每次都类似划分这样 [x][n-1个元素]
 
此时： T(n) = T(n - 1) + (n - 1) ;   //  这个是 n^2 
 
3. 在一般情况下， partiation 即使划分得很偏，比如划分在 1 / 10 位置
 
  此时 T(n) = T(1 / 10) + T(9 / n) + n - 1,  这个东西也是nlog(n)
 
4. 所以在平均情况下，快速排序的复杂度是 nlog(n)
 
 
上面我们选择第一个元素进行划分，可以采用随机或者三数取中以获得更好的划分。
 
 
对于quick sort的另一个精彩的分析，请看《代码之美》中的《我从未编写过的最漂亮的代码》
 
 
 那还有一个问题：标准库是怎么做的呢？我们看看代码（开源多么好呀~~ 可以让我们有无数免费学习资源）
 
```java
public class Arrays {  
    // Suppresses default constructor, ensuring non-instantiability.  
    private Arrays() {  
    }  
    // 中间省略好多  
    public static void sort(int[] a) {  
    sort1(a,  0,  a.length);  
    }  
```
 
go on!
 
```java
void sort1(int x[], int off, int len) {  
    // Insertion sort on smallest arrays  
    if (len < 7) {  
        for (int i = off; i < len + off; i++)  
            for (int j = i; j > off && x[j - 1] > x[j]; j--)  
                swap(x, j, j - 1);  
        return;  
    }  
```
 
 
当数组长度小于7个时， 采用插入排序更快
 
接下来是选划分元素, 看看它是怎么选的
 
```java
// Choose a partition element, v  
int m = off + (len >> 1);       // Small arrays, middle element  
if (len > 7) {  
    int l = off;  
    int n = off + len - 1;  
    if (len > 40) {        // Big arrays, pseudomedian of 9  
    int s = len / 8;  
    l = med3(x,  l,  l + s,  l + 2 * s);  
    m = med3(x,  m - s, m, m + s);  
    n = med3(x, n-  2 * s, n - s, n);  
    }  
    m = med3(x,  l, m, n); // Mid-size, med of 3  
}  
long v = x[m];  
```
 
三数取中，只是当数组大于40个元素时， 更复杂些，让划分元素选得更平均
 
下面就是划分：（中文注释是我注的）
 
```java
int a = off, b = a, c = off + len - 1, d = c;  
// 下面的while 把数组分成四部分  
// [.., a) [a, b) (c, d]  (d, ..)   
// [.., a)  == v, [a, b) < v, (c, d] > v, (d, ..) == v  
while (true) {  
    while (b <= c && x[b] <= v) {  
        if (x[b] == v)  
            swap(x, a++, b);  
        b++;  
    }  
    while (c >= b && x[c] >= v) {  
        if (x[c] == v)  
            swap(x, c, d--);  
        c--;  
    }  
    if (b > c)  
        break;  
    swap(x, b++, c--);  
}  
```
  
// Swap partition elements back to middle  
// 然后把开始和结束两个部分交换到中间来, 就OK啦!  

```java
int s, n = off + len;  
s = Math.min(a - off, b - a);  
vecswap(x, off, b - s, s);  
s = Math.min(d - c, n - d - 1);  
vecswap(x, b, n - s, s);  
```

可以看到，标准库的算法也比较简单明了
 
那C标准库是怎么实现的呢？，会不会飞快？
 
于是我在vs目录下找到了qsort.c, 看看微软的c标准库的实现
 
注：代码中的中文注释是我注的：）
 
```c
/* below a certain size, it is faster to use a O(n^2) sorting method */  
   if (size <= CUTOFF) { // 宏 CUTOFF = 8  
       __SHORTSORT(lo, hi, width, comp, context);  
   }  
```
    
  
当数组小于8个，采用“插入排序”，因为更快 （在算法笔记1中， 我们比较了插入排序和归并排序，当n<=9 时， 插入排序比较次数会少于 归并排序， 这里选用8）
 
再来看看 qsort是怎么样选用划分元素的：
 
```c
/* First we pick a partitioning element.  The efficiency of the 
   algorithm demands that we find one that is approximately the median 
   of the values, but also that we select one fast.  We choose the 
   median of the first, middle, and last elements, to avoid bad 
   performance in the face of already sorted data, or data that is made 
   up of multiple sorted runs appended together.  Testing shows that a 
   median-of-three algorithm provides better performance than simply 
   picking the middle element for the latter case. */  

mid = lo + (size / 2) * width;      /* find middle element */  

/* Sort the first, middle, last elements into order */  
if (__COMPARE(context, lo, mid) > 0) {  
    swap(lo, mid, width);  
}  
if (__COMPARE(context, lo, hi) > 0) {  
    swap(lo, hi, width);  
}  
if (__COMPARE(context, mid, hi) > 0) {  
    swap(mid, hi, width);  
}  
```
 
代码的注释很清楚了： 这里先将第一，最后，中间三个元素进行排序，然后选用中间的元素作为划分元素。

并且没有把他交换到第一个来，以提高效率。
 
选好了划分元素，下面就是划分了：
 
```c
for (;;) {  
    if (mid > loguy) {  
        do  {  
            loguy += width;  
        } while (loguy < mid && __COMPARE(context, loguy, mid) <= 0);  
    }  
    if (mid <= loguy) {  
        do  {  
            loguy += width;  
        } while (loguy <= hi && __COMPARE(context, loguy, mid) <= 0);  
    }  
```
 
上面代码仅是一部分， 而且我删除了注释（循环不变式等内容）， 但是从代码中我们可以看出，它是采用了我们partation2的划分策略。 而且做了适当修改（因为划分元素在中间）

```c
/* We've finished the partition, now we want to sort the subarrays 
   [lo, higuy] and [loguy, hi]. 
   We do the smaller one first to minimize stack usage. 
   We only sort arrays of length 2 or more.*/  

if ( higuy - lo >= hi - loguy ) {  
    if (lo < higuy) {  
        lostk[stkptr] = lo;  
        histk[stkptr] = higuy;  
        ++stkptr;  
    }                           /* save big recursion for later */  

    if (loguy < hi) {  
        lo = loguy;  
        goto recurse;           /* do small recursion */  
    }  
}  
```
 
当划分好元素后，是否进行递归 qsort呢？ 标准库中为了提高效率，不是采用递归， 而是使用goto来进行
 
因为每次分割有两部分，先处理小的部分以减少栈的使用空间。
 
最后，再处理保存在栈中的另外一部分
 
```c
/* We have sorted the array, except for any pending sorts on the stack. 
   Check if there are any, and do them. */  
  
--stkptr;  
if (stkptr >= 0) {  
    lo = lostk[stkptr];  
    hi = histk[stkptr];  
    goto recurse;           /* pop subarray from stack */  
}  
else  
    return;                 /* all subarrays done */  
```
 
 到此完结：）
 
可以看到算法是一样的，但充分进行了优化优化再优化：）
