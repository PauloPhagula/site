---
layout: post
title:  "Measuring query progress in SQL Server with DBCC!"
date:   2014-07-25 15:09:42 +0200
categories: Coding
tags: sqlserver DBCC
excerpt: ""
---
Então, hoje, depois de conseguir corromper uma base de dados tive de usar um bando de truques para conseguir restaurar a base de dados. Um dos passos envolve usar o comando `DBCC CHECK` que leva muito tempo. Após uns 30 minutos estava em pânico e impaciente porque o processo demorava e não tinha ideia de quanto o processo já havia corrido. Como todo bom Googler fui googlar, e eis que achei a solução: [Dynamic Management Views (DMVs)](http://msdn.microsoft.com/en-us/library/ms188754.aspx).

As DMVs (e algumas funções) retornam dados sobre o estado do server, que podemos usar para monitorar a 'saúde' de um server. A DMV em destaque é `sys.dm_exec_requests`, que permite ver quais os processos ou pedidos em execução. A DMV retorna os dados para varias base de dados, mas podemos sempre filtar usando a clausula `WHERE` como abaixo:

{% highlight sql %}
SELECT session_id ,
    request_id ,
    percent_complete ,
    estimated_completion_time ,
    DATEADD(ms, estimated_completion_time, GETDATE()) AS TempoEstimado, 
    start_time,
    status,
    command,
    *
FROM sys.dm_exec_requests
WHERE database_id = 23
{% endhighlight %}

No caso do `DBCC CHECK` ele internamente subdivide-se em 3 outros processos, cada um com seu progresso respectivamente:

- `DBCC CHECKALLOC`
- `DBCC CHECKTABLE`
- `DBCC CHECKATALOG`

Para ver o progresso destes processos também, podemos fazer o `JOIN` com a DMV `sys.dm_os_tasks` que lista todas as tarefas do OS com base no ID da sessão.

{% highlight sql %}
SELECT * 
FROM sys.dm_exec_requests r
    JOIN sys.dm_os_tasks t on r.session_id = t.session_id
WHERE r.session_id = 69
{% endhighlight %}