---
title: USSD apps in Moz
layout: post
language: pt
---

:weary: Já havia respondido a essa pergunta aqui alguma vez.
Gostava que estivesse numa espécie de fórum, e pudéssemos apenas colocar aqui um link.

De qualquer modo, mais uma vez, aqui vai:

Antes de mais, não recomendo que use esses simuladores. Nenhum funciona da forma particular como os GWs USSD dos operadores cá em Moçambique funcionam.
Na melhor da hipóteses, vais aprender apenas um pouco sobre o protocolo. Mas para usares a app que "já fizeste" com os operadores de cá, não vais apenas trocar parametros.

Do que sei, há duas formas de fazeres a tua app USSD funcionar cá em Moçambique.
Conexão directa com cada uma das operadoras, ou usando um agregador.

Pense no agregador como um proxy que uniformiza a API para o USSD com cada um dos operadores.
Só vais precisar lidar com ele, e ele vai resolver o assunto todo com as operadoras por trás.
Eu em particular, apenas trabalhei com um agregador (não sei se há mais), chamado m-connect (https://www.mconnect-mz.com/)
há alguns anos atrás. Eles fazem-te este tipo de agregação para USSD e para SMS. Eles já têm os contactos e conexões com as operadoras.
Vais precisar entrar em acordo com eles sobre os taxas que te vão cobrar por "n" segundos de sessão USSD.
As taxas podem variar de operador para operador, já que cada um usa critérios/preçários diferentes.

Se fores a fazer as conexões directamente com as operadoras, vais precisar tu mesmo, ir atrás
dos contactos certos com cada uma das operadoras. Negociar preçário (se houver espaço para tal).
Criar uma infraestrutura que vá de conformidade com os requisitos de cada um (uns precisam que uses
HTTPs; outros preferem uma VPN; uns usam SOAP; outros usam ReST). E por fim aprender a API de cada um deles. E só então "ligar" a app que "já fizeste".

Vais também precisar de um shortcode (*XXX#). Para isso, vais ter de procurar e pagar com a ARECOM (antigo INCM; Regulador da área de comunicação/telefonia móvel no país).
Vai ser um custo (na minha opinião particular) injustificado, e muito "suave" ao bolso.
Se usares o agregador ele ajuda-te com a papelada e contactos.

Já fiz dos dois modos. E para mim em particular se houver fundos, vale a pena pagar ao agregador.
Não vale nada a maçada que vais ter em ir buscar contactos, negociar, falar com técnicos de cá e de lá.

Parece uma tarefa difícil, mas isso é só a minha forma de escrever e reflexo de noites a tomar café:D

---

Conselhos não pedidos:

- Se é que vais na onde inovar, startapismo, e etc. Garanta antes de implementar que há de facto interesse genuino em usar-se o teu serviço.
  Senão não vais render do teu investimento de tempo quanto de fundos.
- USSD é apenas mais uma interface para serviços web. Se vais começar uma ideia nova, e vais na onda de MVP, use uma outra interface para o teu serviço (web, app, whatsapp group, etc) para provar se o teu serviço tem o "sal" necessário para o mercado ou não.
  Aparentam-me ser mais baratas, flexiveis e conhecidadas.
  O tempo e esforço envoldidos nisto não é trivial.
- Quando escolhes usar uma ferramenta precisar entender bem não só modelo de funcionamento, mas também o modelo de falhas.

  Pense nestas questões: como vais lidar com drops de conexões, como vais re-engajar com o teu user, como vais saber onde os teus users pararam num certo workflow.
  Todas estas perguntas envolvem

Se preferes passar a batata quente a terceiros recomendo

- https://www.ux.co.mz/
- http://www.source.co.de/pt/contactus.php
