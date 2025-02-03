---
layout: post
title: MySQL queries fail due to ONLY_FULL_GROUP_BY sql_mode after updating to v5.7.*
excerpt: >
  Recently, on an live project, we've updated our MySQL server version so we could
  use the new JSON field introduced in v5.7.8. We were successful in our quest,
  but, what we didn't expect, was the following stream of errors in queries.
  Find in this post, what caused these errors and how we fixed them (or at least
  circumvented for the time being)
date: 2016-06-21 00:00:00 +0200
categories: Coding
tags: Database MySQL SQL
---

On v5.7.8, MySQL, introduced a new kind of field: the almighty [JSON field](https://web.archive.org/web/20160616111907/http://dev.mysql.com:80/doc/refman/5.7/en/json.html),
famous for its versatility and glory in the NoSQL world.

In a quest for staying up-to-date, using, benefiting and profiting from its awesome
features --- blog post on we use it coming soon --- we had to upgrade our server
from the now old v5.6.10.

The upgrade process was smooth and nothing of extraordinary popped-up in the logs
--- yes, we kept watch for a while just to make sure --- so we believed we were
safe ... but, we were not ...

A few hours later, errors like the following started filling the log:

> Database error Expression #2 of SELECT list is not in GROUP BY clause and contains
> non-aggregated column `<column-name>` which is not functionally dependent on
> columns in GROUP BY clause; this is incompatible with sql_mode=only_full_group_by
> for query `<select-query-which-old-version-let-pass>`

There are two things to notice here

1. All of these queries were running before and MySQL was ok with how they were
  written.
2. The error message mentions incompatibility with a `sql_mode=only_full_group_by`.
  So what is this `sql_mode`?

This is what the official documentation has to say about the `sql_mode`:

> The MySQL server can operate in different SQL modes, and can apply these modes
> differently for different clients, depending on the value of the sql_mode system
> variable. DBAs can set the global SQL mode to match site server operating
> requirements, and each application can set its session SQL mode to its own
> requirements.
>
> Modes affect the SQL syntax MySQL supports and the data validation checks it
> performs. This makes it easier to use MySQL in different environments and to
> use MySQL together with other database servers.

That meant to us that somewhere in this new version, MySQL changed it's `sql_mode`,
and that we have to find this place and change things back. Again the official
documentation helped us confirming our suspicious as it states that:

> In MySQL 5.7.5, the ONLY_FULL_GROUP_BY SQL mode is enabled by default because
> GROUP BY processing has become more sophisticated to include detection of
> functional dependencies.

The temporary solution which we adapted was to set the `sql_mode` to an empty
value which then defaults to `NO_AUTO_CREATE_USER` which came as default for v5.6.10>.
But, in the end we'll have to upgrade our queries to be compliant with the new
`sql_mode` as definitive fix.

---

References:

- [MySQL Error caused by sql_mode=only_full_group_by](https://web.archive.org/web/20160702084752/http://www.anujgakhar.com:80/2015/12/23/mysql-error-caused-by-sql_modeonly_full_group_by/)
- [Changes in MySQL 5.6.10 (2013-02-05, General Availability)](https://web.archive.org/web/20160527113655/http://dev.mysql.com/doc/relnotes/mysql/5.6/en/news-5-6-10.html)
- [SQL Mode Changes in MySQL 5.7](https://web.archive.org/web/20160619211221/https://dev.mysql.com/doc/refman/5.7/en/sql-mode.html)
