---
layout: post
title: A few MySQL subtleties and how to go about them
excerpt:
date: 2017-01-12 00:00:00 +0200
categories: Coding
tags: mysql
---

MySQL is the most widely used database in the world. It is in the LAMP stack
commonly used by Web Developers and supports many software bundles like
WordPress and Drupal which in turn support most of the sites in the internet.

Its users range from the one-man-band-man hard-core developers writing
code in their basements, to the super-mega enterprises like Facebook,
Github, Google, and Wikipedia just to name a few.

(Almost everyone uses it -- that's what I want to say)

Now, despite its very large user base, there are still many misconceptions/subtleties
about how to use it and properly setup, that usually go unnoticed until its too
late, or that are initially unusual/unexpected by people (like me) used to other
database products. At large, this is due to ignorance on developers
(which commonly have to act as DBAs), but mostly to MySQL itself which acts in
a very uncommon way --read insecure, non-ANSI compliant, shit-show like style--
by default.

The fact that it's so easy to setup and use, allows almost anyone,
beginner or not, to just fire it and rock on.

This post is not about ranting about MySQL nor promoting `<insert-your-favorite-db-here>`
--I'll do my best to control my emotions, I promise!. Its about sharing details
on a set of subtleties I found in my experience (coming from SQL Server and Oracle),
and how you can go about them so you're not caught off guard as I was.

## Division by zero equals NULL

Here we go

```sql
mysql> SELECT 1/0;
+------+
| 1/0  |
+------+
| NULL |
+------+
1 row in set (0.00 sec)
```

OMG. Imagine that is somewhere deep in the middle of your code. Incorrect
reports, incorrect business decisions taken, kittens dying.

How could you avoid this? Set your MySQL mode to `ERROR_FOR_DIVISION_BY_ZERO`
and `STRICT_ALL_TABLES`. Now, whenever you do that an error will be produced
instead. Let's try it.

```sql
mysql> SET SESSION sql_mode = 'ERROR_FOR_DIVISION_BY_ZERO,STRICT_ALL_TABLES';
Query OK, 0 rows affected, 1 warning (0.00 sec)

mysql> SELECT @@sql_mode;
+----------------------------------------------+
| @@sql_mode                                   |
+----------------------------------------------+
| STRICT_ALL_TABLES,ERROR_FOR_DIVISION_BY_ZERO |
+----------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT 1/0;
+------+
| 1/0  |
+------+
| NULL |
+------+
1 row in set, 1 warning (0.00 sec)
```

"What? WTF man, that's just a warning, I expected an error!" You say.
I hear you. Let's look at this warning

```sql
mysql> show warnings;
+---------+------+---------------+
| Level   | Code | Message       |
+---------+------+---------------+
| Warning | 1365 | Division by 0 |
+---------+------+---------------+
1 row in set (0.00 sec)
```

Hm, it seems like the SQL mode just produces warnings, but let's try it with a
table

```sql
mysql> CREATE TABLE test(value int);
Query OK, 0 rows affected (0.04 sec)

mysql> INSERT INTO test(value) VALUES(1/0);
ERROR 1365 (22012): Division by 0
```

It seems SQL mode won't cut it all times. Simple `SELECT` statements will not be
fully covered for these kinds of errors, only your table data (what you `INSERT`
and `UPDATE`) will.

Let's confirm this by looking at another example with `SELECT`s and table data.

```sql
mysql> SELECT count(*)/0 FROM test;
+------------+
| count(*)/0 |
+------------+
|       NULL |
+------------+
1 row in set, 1 warning (0.01 sec)

mysql> SELECT value/0 FROM test WHERE value=1;
+---------+
| value/0 |
+---------+
|    NULL |
+---------+
1 row in set, 1 warning (0.00 sec)
```

That's it indeed, for `SELECT`s all we get is a warning, but at least we're covered
from data corruption. It is not perfect but should help a bit, also if your
database interface allows, you can tell it to convert the warnings into errors
in which case you would get "full protection". In the absence of that feature a
technique that I've seen some people use is to try to cover for the zero case by
using `IF`s or `NULLIF`s, more or less like so:

```sql
SELECT 1/nullif(some_column, 0); -- returns null
-- OR
SELECT 1/if(some_column = 0, 1, some_column); -- returns 1
```

I do not like this technique as I have to remember to do that, plus it makes the
query ugly. But since practicality speak lauder than my tastes, ultimately, I have
to go with the less worse solution, which in this case seems to be the last one.

WARNING: this is just an example, and setting the SQL mode for the session suffices,
but in a real world scenario you should set your SQL mode on the server's
configuration file, so it affects every single connection and the settings can
persist after reboots.

## '' = 0

```sql
mysql> SELECT ''=0;
+------+
| ''=0 |
+------+
|    1 |
+------+
1 row in set (0.01 sec)
```

It could be said that this is not a problem since many programming languages do
this. But the thing is that SQL is not a programming language (each database vendor
adds their own procedural extensions to SQL to make it be more like a programming
language and cater for the "limitations" of pure SQL) and furthermore my expectations
about how things should work in the database are completely different from how
they should work in a programming language.

Anyhow, the kicker is that the behavior is inconsistent when compared with most
programming languages, particularly when the operands for the equality operator
are numbers and strings. See the following sample

```sql
mysql> SELECT 'password'=0;
+--------------+
| 'password'=0 |
+--------------+
|            1 |
+--------------+
```

Two values of different data types, one falsy and another truthy are being compared
somehow and are considered equal. I'd get it if we were comparing a string of
numbers like `'1'` with a number like `1`, but this... this is weird.

Unfortunately, I no longer remember exactly what was the case, but I've had a
situation in the past where this caused me to waste hours to figure out.
All I recall is there was a simple mistake of swapping the values for the fields
in the `WHERE` clause, which caused the query to produce correct results sometimes
but fail unpredictably at others.

What is the way around this? Being careful and minding warnings.

## Zeros in dates and timestamps '0000-00-00 00:00:00'

This is another weird thing about MySQL, it allows for invalid dates containing
zeroes. There are claims for legitimate good cases for having this "feature",
but perhaps I haven't lived long enough to see one just yet. Regardless, the
situation is the one bellow:

```sql
mysql> CREATE TABLE test (birth_day date, created_at datetime);
Query OK, 0 rows affected (0.02 sec)

mysql> INSERT INTO test VALUES('0000-00-00', '0000-00-00 00:00:00');
Query OK, 1 row affected (0.00 sec)

mysql> INSERT INTO test VALUES('2000-10-00', '0000-00-00 19:30:00');
Query OK, 1 row affected (0.00 sec)

mysql> SELECT * FROM test;
+------------+---------------------+
| birth_day  | created_at          |
+------------+---------------------+
| 0000-00-00 | 0000-00-00 00:00:00 |
| 2000-10-00 | 0000-00-00 19:30:00 |
+------------+---------------------+
2 rows in set (0.00 sec)
```

Suppose you're called in to analyze this data. How would you interpret it?

This seems like a bad usage of the typing system. If we're going to represent
missing data why not simply use `NULL`, since that is precisely what it is for?!

In the same token, its contradictory to mandate that a field be `NOT NULL`, but
then go and keep invalid values on it. We would be respecting the constraint but
at the expense of littering data with insignificant and hard (if at all) interpretable
values.

I remember working on an HR system where zeroes where allowed in the dates.
Whenever a date was missing, `0000-00-00` was used instead, and as a result queries
for computing the candidates experience would bring inconsistent results.

How to avoid this? Set SQL mode to include `STRICT_ALL_TABLES`, `NO_ZERO_DATE`
and `NO_ZERO_IN_DATE`, so that it complains appropriately upon the presence of
incorrect date values. Let's try it:

```sql
mysql> SET SESSION sql_mode = 'NO_ZERO_DATE,NO_ZERO_IN_DATE,STRICT_ALL_TABLES';
Query OK, 0 rows affected, 1 warning (0.00 sec)

mysql> INSERT INTO test VALUES('2000-10-00', '0000-00-00 19:30:00');
ERROR 1292 (22007): Incorrect date value: '2000-10-00' for column 'birth_day' at row 1
```

NOTE: You must combine all these 3 sql modes. Without strict mode MySQL will still
behave incorrectly and raising warning but ultimately no protection is provided.
See bellow:

```sql
mysql> SET SESSION sql_mode = 'NO_ZERO_DATE,NO_ZERO_IN_DATE';
Query OK, 0 rows affected, 1 warning (0.00 sec)

mysql> INSERT INTO test VALUES('2000-10-00', '0000-00-00 19:30:00');
Query OK, 1 row affected, 2 warnings (0.00 sec)

mysql> SELECT * FROM test;
+------------+---------------------+
| birth_day  | created_at          |
+------------+---------------------+
| 0000-00-00 | 0000-00-00 00:00:00 |
+------------+---------------------+
1 row in set (0.00 sec)
```

Note how not only it "simply" raised warnings, but it also replaced our values
with zeros, which is much worse than what we had to begin with.

## TIMESTAMP vs DATETIME

Some people unknowingly use these data types as if they were synonymous, but in
reality they're different and appropriate for different usage scenarios. The
sample bellow should clarify what I mean:

```sql
SET SESSION time_zone='+2:00';

CREATE TABLE dates (
    date_timestamp timestamp,
    date_datetime datetime
)

-- Inserting the exact same value to both columns
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
The current time zone is available as the value of the `time_zone` system variable.

Which one to use? It depends on your situation and needs. Let that guide your
choices and you should be fine.

## UTF8 is not UTF8 aka Can you INSERT 💩?

This is serious, can you `INSERT` 💩 in your table? ...No?

Why not? It's UTF-8 right? I saw you doing the `CHARSET` thing when you created
your table...

To be fair, encodings, unicode, character sets and collations make my head
hurt and I'm not a smart guy so I'll just give you the bottom line and
refer to a place where you can know more.

Bottom line is: if you created a table with `CHARSET uft8` then it won't work
with 💩, that is, you're not supporting all characters in unicode, and so
people cannot leave emojis on comments, or write asian kanjis or characters,
on your site/app. This is because UTF8 (the real one) is `utf8mb4`, not
`utf8` as is said in many places on the internet.

Let's do the test.

```sql
-- Lets try uft8

CREATE DATABASE test;

USE test;

CREATE TABLE poo_utf8 (
    contents varchar(191)
) CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO poo_utf8(contents) VALUES ('big ol pile of 💩');
Query OK, 1 row affected, 1 warning (0.01 sec)
```

Oh, lovely... let's query it then

```sql
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

```sql
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

BTW on MySQL 8 this is going to be the default, but we all know everyone must do
ceremonies and rituals prior to migrating, so...

To know the exact details of why this is so check out https://mathiasbynens.be/notes/mysql-utf8mb4

## The `CHECK` constraint is only parsed but ignored in the end

This has been in MySQL since forever and not even MySQL 8 will fix it. MySQL parses
the `CHECK` constraints when defining tables but it doesn't enforce them. They're
just there but do nothing.

The example bellow depicts the behavior. On it we imagine defining a `people`
table. Its just supposed to keep the id, name and gender of for each person. In
order to save a bit of space we want to constrain the value that can go in gender
to `m` or `f`, standing for male and female. We use the `CHECK` constraint for it.

```sql
CREATE TABLE people (
  id INT NOT NULL PRIMARY KEY auto_increment,
  name varchar(100),
  gender char(1) CHECK (gender IN ('m', 'f'))
);

mysql> INSERT INTO people (NAME, gender) VALUE ('Paulo', 'h');
Query OK, 1 row affected (0.00 sec)

mysql> SELECT * FROM people;
+----+-------+--------+
| id | name  | gender |
+----+-------+--------+
|  1 | Paulo | h      |
+----+-------+--------+
1 row in set (0.00 sec)
```

As you saw all went well, except MySQL didn't cry when I said my gender was `h`
--for human.

How to go about this? Know that `CHECK` constraints in MySQL are just for show.
You'll need to find another way instead, perhaps triggers or some code in your
application.

## Aggregations without `GROUP BY`

The problem with allowing this kind of stuff is with the results provided.
Let's suppose we have some table to keep records of candidates, those candidates
for something... say vacancies. The candidates can go change through various stages
from registered to hopefully (selected).

Imagine I want to get the total of candidates per each category. I could
(mistakenly) go with a query like `SELECT flow_status, count(*) FROM candidate`,
missing the `GROUP BY`.

```sql
mysql> SELECT flow_status, count(*) FROM candidate;
+-------------+----------+
| flow_status | count(*) |
+-------------+----------+
| registered  |    10761 |
+-------------+----------+
1 row in set (0.01 sec)
```

This result is very likely to be wrong. Given that I'm using aggregate functions
without grouping I'm going to get just one record back, with the count for all
the candidates but only one of `flow_status` (the first in this case).

It could be said that this is a fault on whoever wrote the query, but I disagree
this query should not have been allowed to run in the first place. The parser
should've rejected it.

There are legitimate cases for using aggregations without grouping, but only
aggregations should be allowed then. A basic example would be to know the
average height of the candidates and the count fo them. There's nothing wrong
with that. But as soon you an aggregations and non-aggregations without grouping
then it is very likely you have problem.

The cure for this problem is the same as for the next point. So, just keep going.

## Non-GROUPed-BY nor aggregated columns in SELECT

This is stopped by default starting from MySQL 5.7 as seen these reference
articles:
[http://www.tocker.ca/2014/01/24/proposal-to-enable-sql-mode-only-full-group-by-by-default.html](Proposal to enable sql mode ONLY_FULL_GROUP_BY by default),
[http://mysqlserverteam.com/mysql-5-7-only_full_group_by-improved-recognizing-functional-dependencies-enabled-by-default/](MySQL 5.7: only_full_group_by Improved, Recognizing Functional Dependencies, Enabled by Default!)

However, for those using versions or that do not their settings right, bellow
follows an example of what I mean.

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

Because MySQL doesn't enforce the usage the correct behavior of `GROUP BY` we can
easily return incorrect data by accident, such as above. Luckily this behavior
has been corrected by default since version 5.7 with the mode `ONLY_FULL_GROUP_BY`.
Setting your SQL mode to include it sort things out for you you.

## Data Truncations

MySQL tends to do data truncations whenever a value doesn't fit a column. Like
in the other cases the sin is the silent warning. Let look at an example.

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

You can make MySQL do the right thing by setting the SQL Mode option to
include `STRICT_TRANS_TABLES` or `STRICT_ALL_TABLES`. The difference is that the
former will only enable it for transactional data storage engines. As much as
I'm loathed to say it, I don't recommend using `STRICT_ALL_TABLES`, as an error
during updating a non-transactional table will result in a partial update, which
is probably worse than a truncated field. Setting the mode to `TRADITIONAL`
includes both these and a couple of related ones
(`NO_ZERO_IN_DATE`, `NO_ZERO_DATE`, `ERROR_FOR_DIVISION_BY_ZERO`)

## MySQL uses separate encoding for different parts

In MySQL these components have different encodings:

- Server
- Client
- Connection
- Database
- Table
- Field

```sql
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

There's nothing with the above. In fact it is a feature and I've had good
legitimate cases for having two different encodings in use for different parts.
It's more a good to know thing, as to improve your decisions on configuration,
and helping in managing your expectations upon the server's behavior regarding
this matter.

## Booleans are synonymous with Tiny Integers

In MySQL Booleans are synonymous with tiny integers, actually to be precise
`BOOL`s are aliases for `TINYINT`s. Let's have a look at the sample code

```sql
mysql> CREATE TABLE things (is_fit BOOL);
Query OK, 0 rows affected (0.11 sec)

mysql> DESC things;
+--------+------------+------+-----+---------+-------+
| Field  | Type       | Null | Key | Default | Extra |
+--------+------------+------+-----+---------+-------+
| is_fit | tinyint(1) | YES  |     | NULL    |       |
+--------+------------+------+-----+---------+-------+
1 row in set (0.00 sec)

mysql> SHOW CREATE TABLE things;
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
use `BIT(1)`? This would allow us to save space and is more strict, it only
allows `1` for `true` and `0` for `false`.

Using `TINYINT(1)` can allow from -128 and 127, and a funny guy can set the field
value to something else other than the expect `1` or `0`.

## Bonus: VARCHAR(255) Obsession

I've seen this one over and over and over ... heck, done it myself ... anyway

Stop already with `VARCHAR(255)` Obsession. The thing can go up to 65535.
Yap `VARCHAR(65535)` FTW. Way better than the TEXT you use for most cases.

Only `CHAR` has a limit of 255.

The limit for VARCHAR was lifted from 255 on MySQL 5.0.3. And it is 21844
when using UTF-8 (the real UTF8 not UTF8 :)).

## Why keep MySQL then?

Given all these subtleties why keep MySQL instead of going with something else,
seems to be a legitimate question. After all some people may be used to the level
of strictness of some other vendor's products and may not tolerate these "things".
But just as in every other technological decision there are many other factors
and forces involved -- dark and light. And in this particular case I think there
are more light forces than dark. Though these are my personal reasons for keeping
it I think they will resonate with you:

- Ecosystem (WordPress, Drupal, <insert your favorite CMS here>)
- It's open source, free, has a great community, and lots of resources to learn
  from on the web.
- It's not that bad, you just have to educate yourself, discipline it by setting
  the SQL mode to be reasonable default server wise, and start taking the warnings
  it produces seriously. Whenever you MySQL says there was a warning, `SHOW` it
  as to better decide how to proceed from there.

I promised not to make comparisons with other products, but I'd be remiss if I
didn't mention that if these issues are really bothering you then perhaps you can
try a different distribution of MySQL other than the default one, which usually
have more saner defaults out of the box, like: Percona Server, MariaDB, Drizzle
or WebScaleSQL. They're are MySQL after all.

---

I hope this has been informative for you. Drop a comment bellow if you found
something fishy, agree with my views, or have something to add.

## Refs:

- [Server SQL Modes](https://dev.mysql.com/doc/refman/5.7/en/sql-mode.html)
- [How to support full Unicode in MySQL databases](https://mathiasbynens.be/notes/mysql-utf8mb4)
