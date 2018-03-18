---
layout: page
title: Talks
excerpt: Find here my raw notes on tech, entrepreneurship and other interesting subjects
permalink: /talks/
---

I obsess about a few subjects like:
[Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design),
[Extreme Programing](https://en.wikipedia.org/wiki/Extreme_programming),
[Behaviour-Driven Development](https://en.wikipedia.org/wiki/Behavior-driven_development),
[Software Craftsmanship](http://manifesto.softwarecraftsmanship.org) and more;
and sometimes I (reluctantly) get on stage, as to share my (mis)understandings
and learn from the others.

## Inviting me

If you'd like me to come speak at your event, or a teach a workshop, just ping
me, my contact details are on my [about](/about#contact) page.

## Testimonials

Here are some kind of words about my talks from the good people organizing or
attending events where I've spoken.

> You killed it on your presentation last Friday! You were the life of the meetup. Thanks for coming!
>
> -- Guidione Machava, Head of Community Development @ EngineOne

## Past Talks

Here are some talks/workshops I've presented in the past. You can read their
abstracts, go through the slide decks, and maybe even watch a presentation video.

<ul>
{% assign talks = site.talks | sort: 'date' | reverse %}
{% for talk in talks %}
  <li>
    {% if talk.title %}
    <a href="{{ talk.url }}" title="See the details of the '{{ talk.title }}' talk">{{ talk.title }}</a>
    {% endif %}
    @ <a href="{{ talk.event.url }}" target="_blank" title="See the '{{ talk.event.name }}' site">{{ talk.event.name }}</a>
    on {{ talk.date | date: "%d %b %Y" }}
    in {{ talk.event.location}}
  </li>
{% endfor %}
</ul>
