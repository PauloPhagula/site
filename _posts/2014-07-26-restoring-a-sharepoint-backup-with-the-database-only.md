---
layout: post
title:  "Restaurando um backup de Share Point usando apenas a base dados"
date:   2014-07-26 09:57:07 +0200
categories: Coding
tags: note sharepoint database sqlserver
excerpt: ""
---
Então você tem que restaurar um backup de SharePoint mas  não consegue fazê-lo usando a interface do *Central Administration*, pelos mais variados erros. 
Mas, no entanto, você tem acesso directo a base de dados de conteúdo via SQL Server ou consegue identificar o ficheiro de backup da base de dados de conteúdo dos outros  na pasta onde tem o backup da *farm* do SharePoint.


1. Primeiro faça o restore da base de dados no SQL Server.
2. Adicione a base de dados ao SharePoint via PowerShell, usando o comando:  `stsadm -o addcontentdb - url <nova url> -databasename <nome da base de dados restaurada>`
![Adicionando Base de dados de conteudo ao sharepoint](http://localhost:8888:8888/wp-content/uploads/2014/07/Adicionando-Base-de-dados-de-conteudo-ao-sharepoint2-300x36.png)
3. Certifique de criar a *web application* para associar a base de dados.  Ao fazer este passo o sharepoint irá criar uma base de dados de conteúdo, esta devera ser retirada para dar espaço para associação da aplicação com a BD que realmente queremos usar.
4. Para dissociar a DB recentemente criada da aplicação primeiro obtemos o seu Id usando o comando `Get-SPContentDatabase` e depos usamos o comando `Dismount-SPContentDatabase` para a dissociação.
![Dissasociar DB de SharePoint](http://localhost:8888:8888/wp-content/uploads/2014/07/Dissasociar-DB-de-SharePoint-300x78.png)
5. Associamos a nossa BD de conteúdo a aplicação usando o comando Mount-SPContentDatabase



