---
layout: page
title: Blog
excerpt: Find here the listing of all blog entries and register for notifications on future updates
permalink: /blog/
---

<div>
{% for post in site.posts %}
  {% capture currentyear %}{{ post.date | date: "%Y" }}{% endcapture %}
  {% if currentyear != year %}
    {% unless forloop.first %}</ul>{% endunless %}
    <h2>{{ currentyear }}</h2>
    <ul class="no-list posts-list">
    {% capture year %}{{ currentyear }}{% endcapture %}
  {% endif %}
  {% if post.url %}
    <li class="posts-list-item">
      {% if post.category == "speaking" %}
        <i class="fa fa-microphone"></i>
      {% endif %}
      <time class="post-meta">{{ post.date | date: "%b %d" }}</time>
      <a class="post-link" href="{{ post.url }}" title="{{post.title}}">{{ post.title }}</a>
    </li>
  {% endif%}
{% endfor %}
</ul>
</div>
