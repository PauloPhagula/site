---
layout: post
title: The Perils of MySQL
excerpt:
date: 2017-01-12 00:00:00 +0200
categories: Coding
tags: mysql
---

MySQL is the most widely used database in the world. It is in the LAMP stack
commonly used by Web Developers and supports many software bundles like
WordPress and Drupal which in turn support most of the websites in the internet.

Its users range from the one-man-band-man hard-core developers writing
code in the basements, to the super-mega enterprises like Facebook,
Github, Google, and Wikipedia just to name a few.

(Almost everyone uses it -- that's what I want to say)

Now, despite its very large user base, there are still many misconceptions
/ particularities / subtleties about how to use it and properly setup,
that usually go unnoticed until its too late. At large, this is due to
ignorance on developers (which commonly have to act as DBAs), but mostly
to MySQL itself which acts in an very uncommon way -- read insecure,
non-ANSI compliant, shit-show like style -- by default.

The fact that it's so easy to setup and use, allows almost anyone,
beginner or not, to just fire it and rock on.

This series is not about ranting about MySQL nor promoting `<insert-your-favorite-db-here>`
--I'll do my best to control my emotions. Its about sharing details on a set
of subtleties I found in my experience with you and how you can go about
them, so you're not caught off guard as I was.

Before you question my experience, just know that I was one of those lucky
folks who got to manage 200GB sized databases made of 10 years of business
transactions data. I eat SQL for lunch my friend. So, trust me, I know a thing
or too.

(OK now that you did your self-promo can you move on)

I have — purposefully — planned 13 (that's the number of bad-luck) parts for
this series, but we'll see how it goes.

## Division by zero equals NULL

Here we go

```log
mysql> select 1/0;
+------+
| 1/0  |
+------+
| NULL |
+------+
1 row in set (0.00 sec)
```

OMG. Imagine that is somewhere deep in the middle of your code. Incorrect
reports, incorrect business decisions taken, kittens dying.

## '' = 0

```log
mysql> select ''=0;
+------+
| ''=0 |
+------+
|    1 |
+------+
1 row in set (0.01 sec)
```

TODO: Add comment. If worth it anyway

## Zero in dates and timestamps '0000-00-00 00:00:00'

## TIMESTAMP vs DATETIME

```sql
SET SESSION time_zone='+2:00';

CREATE TABLE dates (
    date_timestamp timestamp,
    date_datetime datetime
)

INSERT INTO dates (date_timestamp, date_datetime) VALUES ('2017-07-09 20:11:00', '2017-07-09 20:11:00');

mysql> SELECT * FROM dates;
+---------------------+---------------------+
| date_timestamp      | date_datetime       |
+---------------------+---------------------+
| 2017-07-09 20:11:00 | 2017-07-09 20:11:00 |
+---------------------+---------------------+
1 row in set (0.00 sec)

SET SESSION time_zone='+4:00';

mysql> SELECT * FROM dates;
+---------------------+---------------------+
| date_timestamp      | date_datetime       |
+---------------------+---------------------+
| 2017-07-09 22:11:00 | 2017-07-09 20:11:00 |
+---------------------+---------------------+
1 row in set (0.00 sec)
```

MySQL converts `TIMESTAMP` values from the current time zone to UTC for storage,
and back from UTC to the current time zone for retrieval. (This does not occur
for other types such as `DATETIME`.) By default, the current time zone for each
connection is the server's time. The time zone can be set on a per-connection basis.
As long as the time zone setting remains constant, you get back the same value
you store. If you store a `TIMESTAMP` value, and then change the time zone and
retrieve the value, the retrieved value is different from the value you stored.
This occurs because the same time zone was not used for conversion in both directions.
The current time zone is available as the value of the time_zone system variable.

## UTF8 is not UTF8 aka Can you INSERT 💩?

This is serious, can you INSERT 💩 in your table? ...No?

Why not? It's UTF-8 right? I saw you doing the CHARSET thing when you created
your table...

To be fair, encodings, unicode, charsets and collations make my head
hurt and I'm not a smart guy so I'll just give you the bottom line and
refer to a place where you can know more

Bottom line is: if you created a table with `CHARSET uft8` then it won't work
with 💩, that is, you're not supporting all characters in unicode, and so
people cannot leave emojis on comments or write asian kanjis or characters,
on your site/app. This is because UTF8 (the real one) is `utf8mb4`, not
`utf8` as is said in many many places on the internet.

Let's do the test.

```sql
-- Lets try uft8

CREATE DATABASE test;

USE test;

CREATE TABLE poo_utf8 (
    contents varchar(191)
) CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO poo_utf8(contents) VALUES ('big ol pile of 💩');
```

Query OK, 1 row affected, 1 warning (0.01 sec)

Oh, lovely... lets query it then

```txt
mysql> SELECT * FROM poo_utf8;
+------------------+
| contents         |
+------------------+
| big ol pile of ? |
+------------------+
1 row in set (0.01 sec)
```

What the 💩? Where is my *** 💩? Where did it go?

Told you

```sql
-- Now let's try utf8mb4
CREATE TABLE poo_utf8mb4 (
    contents varchar(191)
) CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO poo_utf8mb4(contents) VALUES ('big ol pile of 💩');

SELECT * FROM poo_utf8mb4;
```

```txt
mysql> SELECT * FROM poo_utf8mb4;
+---------------------+
| contents            |
+---------------------+
| big ol pile of 💩     |
+---------------------+
1 row in set (0.00 sec)
```

(sigh) There's my lovely 💩.

Don't let anyone take your 💩. Use `utf8mb4` and `utf8mb4_unicode_ci`.

Of course 💩 was just an example. If you want to support any character
you need to use "proper" UTF8.

BTW on MySQL 8 This is going to be the default.

To know the exact details of why this is so check out https://mathiasbynens.be/notes/mysql-utf8mb4

## The `CHECK` constraint is only parsed but ignored in the end

## Aggregations without `GROUP BY`

```sql
mysql> select flow_status, count(*) from candidate;
+-------------+----------+
| flow_status | count(*) |
+-------------+----------+
| registered  |    10761 |
+-------------+----------+
1 row in set (0.01 sec)
```

## non-GROUP nor aggregated columns in SELECT

this is stopped by default starting from MySQL 5.7

[http://www.tocker.ca/2014/01/24/proposal-to-enable-sql-mode-only-full-group-by-by-default.html](Proposal to enable sql mode ONLY_FULL_GROUP_BY by default)
[http://mysqlserverteam.com/mysql-5-7-only_full_group_by-improved-recognizing-functional-dependencies-enabled-by-default/](MySQL 5.7: only_full_group_by Improved, Recognizing Functional Dependencies, Enabled by Default!)

```sql
CREATE TABLE invoice_line_items (
    id INT NOT NULL PRIMARY KEY auto_increment,
    invoice_id INT NOT NULL,
    description varchar(100)
);

INSERT INTO invoice_line_items VALUES
    (NULL, 1, 'New socks'),
    (NULL, 1, 'A hat'),
    (NULL, 2, 'Shoes'),
    (NULL, 2, 'T shirt'),
    (NULL, 3, 'Tie');

mysql> SELECT id, invoice_id, description FROM invoice_line_items GROUP BY invoice_id;
+----+------------+-------------+
| id | invoice_id | description |
+----+------------+-------------+
|  1 |          1 | New socks   |
|  3 |          2 | Shoes       |
|  5 |          3 | Tie         |
+----+------------+-------------+
```

Because MySQL doesn't enforce the usage the correct behavior of GROUP By we can
easily accidentally return incorrect data, such as above. Luckily this behavior
has been corrected by default since version 5.7 with the mode `only_full_group_by`

## Data Truncations

```sql
mysql> CREATE TABLE foo (bar VARCHAR(4));
Query OK, 0 rows affected (0.00 sec)

mysql> INSERT INTO foo (bar) VALUES ("12345");
Query OK, 1 row affected, 1 warning (0.00 sec)

mysql> SHOW WARNINGS;
+---------+------+------------------------------------------+
| Level   | Code | Message                                  |
+---------+------+------------------------------------------+
| Warning | 1265 | Data truncated for column 'bar' at row 1 |
+---------+------+------------------------------------------+
```

Yap your data was truncated just like that. And this also happens on

```sql
ALTER TABLE foo MODIFY COLUMN bar VARCHAR(2);
```

You can make MySQL do the right thing by setting the SQL
Mode option to
include `STRICT_TRANS_TABLES` or `STRICT_ALL_TABLES`. The difference is that the
former will only enable it for transactional data storage engines. As much as
I'm loathed to say it, I don't recommend using `STRICT_ALL_TABLES`, as an error
during updating a non-transactional table will result in a partial
update, which is probably worse than a truncated field. Setting the mode
to TRADITIONAL includes both these and a couple of related issues
(NO_ZERO_IN_DATE, NO_ZERO_DATE, ERROR_FOR_DIVISION_BY_ZERO)

## MySQL uses separate encoding for different parts

- Server
- Client
- Connection
- Database
- Table
- Field

```txt
mysql> \s
--------------
mysql  Ver 14.14 Distrib 5.7.15, for osx10.11 (x86_64) using  EditLine wrapper

Connection id:		6
Current database:	soma
Current user:		root@localhost
SSL:			Not in use
Current pager:		less
Using outfile:		''
Using delimiter:	;
Server version:		5.7.15 MySQL Community Server (GPL)
Protocol version:	10
Connection:		127.0.0.1 via TCP/IP
Server characterset:	utf8mb4
Db     characterset:	utf8
Client characterset:	utf8mb4
Conn.  characterset:	utf8mb4
TCP port:		3306
Uptime:			1 hour 32 min 20 sec

Threads: 5  Questions: 289  Slow queries: 0  Opens: 166  Flush tables: 1  Open tables: 159  Queries per second avg: 0.052
--------------
```

```sql
 CREATE TABLE `demo_encoding` (
  `username` varchar(20) CHARACTER SET latin1 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=greek
```

## Bonus: VARCHAR(255) Obsession

I've seen this one over and over and over ... heck, done it myself ... anyway

Stop already with `VARCHAR(255)` Obsession. The thing can go up to 65535.
Yap `VARCHAR(65535)` FTW. Way better than the TEXT you use for most cases.

Only `CHAR` has a limit of 255.

The limit for VARCHAR was lifted from 255 on MySQL 5.0.3. And it is 21844
when using UTF-8 (the real UTF8 not UTF8 :)).

## Why keep MySQL

- Ecosystem (WordPress, Drupal, <insert your fav cms here>
- It's not that bad you just have to educate yourself and discipline it
- MySQL behavior of silently ignoring errors and not making enough noise
  about can quickly lead us down to a state of data corruption which may
  itself go unnoticed until its too late to do anything about it.

## Booleans are synonymous with Tiny Integers

```sql
mysq> CREATE TABLE things (is_fit BOOL);
Query OK, 0 rows affected (0.11 sec)

mysql> desc things;
+--------+------------+------+-----+---------+-------+
| Field  | Type       | Null | Key | Default | Extra |
+--------+------------+------+-----+---------+-------+
| is_fit | tinyint(1) | YES  |     | NULL    |       |
+--------+------------+------+-----+---------+-------+
1 row in set (0.00 sec)

mysql> show create table things;
+--------+---------------------------------------------------------------------------------------------------+
| Table  | Create Table                                                                                      |
+--------+---------------------------------------------------------------------------------------------------+
| things | CREATE TABLE `things` (
  `is_fit` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 |
+--------+---------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)
```

This is not terrible awful, but if the idea is to save some space why not just
use `BIT(1)`? This would allow us to save space plus is more strict, it only
allows `1` for `true` and `0` for `false`.

Using `TINYINT(1)` can allow from -128 and 127, and a funny guy can set the field
value to something else.

## ENUMS
