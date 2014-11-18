---
layout: post
title: Hibernate学习笔记1–Session与对象
categories: java
---


## 不同的对象状态

在Hibernate中，对象有四种状态(Transient, Persistent, Detached, Removed)
对象通过与Session交互，在这四种状态间进行迁移。

```java
public void test1() {
    Item item = new Item(); // transient

    Session session = HibernateUtil.openSession();
    Transaction tx = session.beginTransaction();

    session.save(item); // persistent
    //session.saveOrUpdate(item);  // persistent

    tx.commit();
    session.close();

    // item is detached
}
```

```java
public void test2() {
    Session session = HibernateUtil.openSession();
    Transaction tx = session.beginTransaction();

    Item item = (Item) session.get(Item.class, 1);

    session.delete(item);
    // item's state is removed

    tx.commit();
    session.close();

    // item's state is transient
}
```


## 在persistent状态下，hibernate会自动检测到对象的修改，并延迟更新到数据库中(会尽可能晚地执行SQL语句)。

```java
public void test3() {
    Session session = HibernateUtil.openSession();
    Transaction tx = session.beginTransaction();

    Item item = (Item) session.get(Item.class, 1);

    item.setName("Another Name");  // 将会自动更新到数据库中, 你不需要调用session.update

    tx.commit();
    session.close();
}
```

默认情况下，hibernate将会对表格中的所有字段进行更新，差不多会产生这样的sql语句:

```sql
update items set name=?, price=? where id=?
```

如果你的字段非常多，或者有些字段非常大，你可以在hbm.xml中设置dynamic-update（dynamic-insert)属性，让其只更新必要的字段：

```xml
<class name="Item" table="items" dynamic-update="true">
```

现在，产生的SQL语句就像这样了：

```xml
update items set name=? where id=?
```

需要注意的是，dynamic-update需要在运行时产生SQL语句, 而原来的update语句是在一开始就产生好的。

什么是尽可能地晚? 默认的时候，大约会在以下三种情况下进行
1. transaction commit
2. 在一个query执行前
3. 当然也可以主动调用session.flush


## object identity & 一级缓存

```java
public void test4() {
    Session session = HibernateUtil.openSession();
    Transaction tx = session.beginTransaction();

    Item item1 = (Item) session.get(Item.class, 1);
    assertNotNull(item1);

    Item item2 = (Item) session.createQuery("from Item item where item.name = :name")
            .setString("name", "item1").uniqueResult();
    assertNotNull(item2);
    assertEquals(1, item2.getId());

    assertTrue(item1 == item2);  // 它们是同一样对象， 虽然通过不同的途经取得

    tx.commit();
    session.close();
}
```

上面这个例子执行了两个SQL语句：

```sql
session.get(... ---->  select ... from items item0_ where item0_.id=?
session.createQuery(... ----> select ... from items item0_ where item0_.name=?
```

在同一个Session中，相同id的对象是同一个对象（上面代码中使用引用比较）。这在面向对象语义上是必要的，因为在数据库中，它们对应于同一条记录。 
这也隐含了session中的对象（即persistent状态下的对象）将以id进行缓存, 这样才能在将来取得其他对象时，与已有的对象进行比较，以达到上面这个要求


```java
public void test5() {
    Session session = HibernateUtil.openSession();
    Transaction tx = session.beginTransaction();

    Item item1 = (Item) session.get(Item.class, 1);
    Item item2 = (Item) session.get(Item.class, 1); // 不需要执行SQL语句，缓存中已有
    assertTrue(item1 == item2); // 它们是同一个对象
    tx.commit();
    session.close();
}
```

上面例子只需要进行一条SQL语句的查询

```java
public void test6() {
    Session session1 = HibernateUtil.openSession();
    Transaction tx1 = session1.beginTransaction();

    Item item1 = (Item) session1.get(Item.class, 1); // 从第一个session取得

    tx1.commit();
    session1.close();

    Session session2 = HibernateUtil.openSession();
    Transaction tx2= session2.beginTransaction();

    Item item2 = (Item) session2.get(Item.class, 1); // 从第二个session取得

    tx2.commit();
    session2.close();

    assertTrue(item1.getId() == item2.getId());  // id 相等
    assertFalse(item1 == item2);  // 却不是同一个对象
}
```

由于session的缓存, 所以当在一个unit work中操作很多对象的时候，就会有问题啦

```java
public class Item {
    private int id;
    private String code;
    private String name;
    private double price;

    private byte[] cache = new byte[10 * 1024 * 1024]; // 添加了这行，内存大户
    ...
```

```java
public void test10() {
    Session session = HibernateUtil.openSession();
    Transaction tx = session.beginTransaction();

    for (int i = 0; i < 100; i++) {
        Item item = new Item();
        session.save(item);
    }

    tx.commit();
    session.close();
}
```

你会看到OutOfMemoryError

你需要这样：

```java
public void test10() {
    Session session = HibernateUtil.openSession();
    Transaction tx = session.beginTransaction();

    //session.setCacheMode(CacheMode.IGNORE); // 如果有二级缓存的话，也需要禁止二级缓存
    for (int i = 0; i < 100; i++) {
        Item item = new Item();
        session.save(item);
        if (i % 3 == 0) {
            session.flush();
            session.clear();
        }
    }

    tx.commit();
    session.close();
}
```


## equals & hashCode

上述例子中
item1 != item2, 因为在不同的session中
item1.getId() == item2.getId()， 因为它们本来就对应数据库中的同一条记录， 属于同一个对象

于是我们期望： item1.equals(item2),  // 我们很多时候都需要这样的东西，contains, hashtable 等等
可是怎么样实现呢， 最直接的想到是用 id, 但是id在transient 往往不存在，而在hibernate save 之后才取得。 这会是一个problem。

所以我们最好是使用 business key(像身份证号, 用户名等，在业务层面确定一个实体) 实现equals。
还要记得，重写equals，一定要重写 hashCode，因为 equals 的两个对象， hashCode 需要相同

像这样：

```java
@Override
public boolean equals(Object other) {
    if (this == other) {
        return true;
    }
    if (other instanceof Item) {
        Item item = (Item) other;
        return this.getCode() == item.getCode(); // code 是item的编号...
    }
    return false;
}

@Override
public int hashCode() {
    return this.getCode().hashCode();
}
```

## session.get & session.load

session.get 会返回实际的对象，而session.load可能会返回一个代理

```java
public void test7() {
    Session session = HibernateUtil.openSession();
    Transaction tx = session.beginTransaction();

    Item item1 = (Item) session.get(Item.class, 1);
    Item item1_ = (Item) session.load(Item.class, 1);  // 会在缓存中找到
    Item item2 = (Item) session.load(Item.class, 2);  // 仅返回一个proxy

    assertTrue(item1 == item1_);  // 它们是同一个对象
    assertTrue(item1.getClass()== Item.class);
    assertTrue(item1_.getClass()== Item.class);

    assertFalse(item2.getClass() == Item.class);  // item2 是一个proxy

    println(item2.getId());  // 此时不需要查询数据库
    println(item2.getClass());
    println(item2.getName()); // 此时再骈查询数据库

    tx.commit();
    session.close();
}
```


在控制台，可以看到类似这样的输出：

```
Hibernate: select ...
class bencode.in.hibernate.model.Item_$$_javassist_0
Hibernate: select ...
item2
```

可以看到，在println(item2.getName()) 的时候，才会去查询数据库。

另外, 当记录不存在时, session.get 会返回null, session.load 会返回一个proxy, 在访问该proxy时，会throw `ObjectNotFoundException`

```java
public void test8() {
    Session session = HibernateUtil.openSession();
    Transaction tx = session.beginTransaction();

    Item item1 = (Item) session.get(Item.class, 1000);
    Item item2 = (Item) session.load(Item.class, 2000);

    assertNull(item1);  // item1 == null
    assertNotNull(item2);  // item2 is a proxy

    try {
        item2.getName();  // 出异常
        fail();
    } catch (Exception ex) {
        assertTrue(ex.getClass() == ObjectNotFoundException.class);
    }

    tx.commit();
    session.close();
}
```


这有啥用呢？ 有时候我们仅仅需要一个对象引用。

假设Item 有一个 many_to_one 的 Part

```xml
<many-to-one name="part" column="part_id"/>
```

```java
public void test11() {
    Session session = HibernateUtil.openSession();
    Transaction tx = session.beginTransaction();

    Item item = (Item) session.load(Item.class, 1);
    Part part = (Part) session.load(Part.class, 1);

    item.setPart(part);

    tx.commit();
    session.close();
}
```


上面的part就不需要载入了, 可能看到，只有两条sql语句：

```
select item...
update items...
```
