---
layout: post
title: Colocando Proxy no Ubuntu
date: 2014-08-23 17:20:19 +0200
categories: Coding
tags: Note bash
excerpt:
lang: pt
---

## No Sistema operativo

Para usar proxy em seu Ubuntu edite o ficheiro `/etc/environment` adicionado com
a estrutura seguinte:
`tipo_de_proxy="http://usuario@senha@servidor:porta"`

Para quem usa uma conta de domínio, é sugestivo colocar o domínio como parte da
linha como abaixo:
`tipo_de_proxy="http://dominio/usuario@senha@servidor:porta"`

A seguir um exemplo completo do ficheiro:

```
#Proxy settings
http_proxy="http://dominio/usuario@s3n#4@prxserver:8080"
https_proxy="http://dominio/usuario@s3n#4prx@server:8080"
ftp_proxy="http://dominio/usuario@s3n#4@prxserver:8080"
no_proxy="localhost,127.0.0.1,localaddress,.localdomain.com"
HTTP_PROXY="http://dominio/usuario@s3n#4@server:8080"
HTTPS_PROXY="http://dominio/usuario@s3n#4@prxserver:8080"
FTP_PROXY="http://dominio/usuario@s3n#4@prxserver:8080"
NO_PROXY="localhost,127.0.0.1,localaddress,.localdomain.com"
```

Note que para o endereço local nem sempre queremos usar o proxy dai o `no_proxy`.


## No gestor de pacotes APT

Após colocar o proxy no sistema operativo, notará que os gestor de pacotes APT
não consegue buscar novos pacotes. Isto porque ele usa uma outra configuração
para o proxy.

A configuração consite em modificar/criar o ficheiro `/etc/apt/apt.conf`
adicionando nele uma linha com a estrutura:
`Acquire::http::Proxy "http://dominio\usuario:senha@servidor:porta";`

NOTE:

Apesar da estrutura de linha ser muito similar. Existe uma diferença na barra
que separa o `dominio` do `nome_de_usuario`. Para o proxy de OS a barra deve ser
para direita e para o proxy de APT é para a esquerda.
