---
layout: post
title:  "Recuperando uma BD sem o Log"
date:   2014-08-15 20:46:14 +0200
categories: Coding
tags: SQLServer
excerpt: ""
lang: pt
---

Então por algum motivo mágico consegui perder o .LDF correcto de uma BD. O .LDF *novo* que tenho é antigo, e assim não consigo fazer o restore. que fazer?

{% highlight sql %}
USE master
GO

SELECT NAME, STATE_DESC FROM SYS.DATABASES 
WHERE STATE_DESC='SUSPECT'
GO

ALTER DATABASE Nome_da_DB SET EMERGENCY
GO

DBCC CHECKDB (Nome_da_DB) 
GO

ALTER DATABASE Nome_da_DB SET SINGLE_USER WITH ROLLBACK IMMEDIATE 
GO

DBCC CHECKDB (Nome_da_DB, REPAIR_ALLOW_DATA_LOSS) 
GO

ALTER DATABASE Nome_da_DB SET MULTI_USER
GO
{% endhighlight %}
