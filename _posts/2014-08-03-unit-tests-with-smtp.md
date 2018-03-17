---
layout: post
title: Testes unitários com SmtpClient
date: 2014-08-03 09:47:59 +0200
categories: Coding
tags: .NET
excerpt:
lang: pt
---

Ao desenvolver um sistema que envie emails, geralmente não se deve enviar os
emails quando se efectuam testes. Pelo contrário, os emails devem estar disponíveis
para investigação / avaliação de resultado e/ou debugging. Como sempre existem
várias alternativas para resolver este problema: Fakes, Mocks ou a Implementação
padrão.

No caso particular do `SmtpClient` é dificil fazer mocks uma vez que os métodos
da classe não são virtuais, isto pelo menos usando a livrária [Moq](https://code.google.com/archive/p/moq/).
Felizmente, esta funcionalidade já está disponivel no .NET e só precisamos activa-la
no ficheiro de configuração `app.config` ou `web.config`.

```xml
<system.net>
  <mailSettings>
    <smtp deliveryMethod="SpecifiedPickupDirectory" from="noreply@tests.com">
      <specifiedPickupDirectory pickupDirectoryLocation="C:\user\Desktop\project\project\bin\emails" />
      <network host="localhost"/>
    </smtp>
  </mailSettings>
</system.net>
```

Note que a configuração `network host` não é usada, mas sem ela ocorre uma
excepção ao fazer o `Dispose` do `SmtpClient`.
