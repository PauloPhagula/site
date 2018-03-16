---
layout: post
title:  "Alargando o HD no VirtualBox"
date:   2014-08-16 12:21:03 +0200
categories: Coding
tags: note virtualbox
excerpt: ""
lang: pt
---

Para alargar um disco virtual no VirtualBox, usa-se o comando VBoxManage em um Terminal de comandos.


1. Primeiro, desliga-se a máquina virtual - assegurar que o estado está definido como desligado, não salvo.
2. Em segundo lugar, abre-se o terminal de Comandos e vai-se para pasta de arquivos da maquina virtual: `cd /mnt/dados/VirtualBox\ VMs/Ruindows/`
3. Executa-se o comando para alargar o HD da VM: `vboxmanage modifyhd "<hd name>" --resize`
