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
    <ul class="no-list">
    {% capture year %}{{ currentyear }}{% endcapture %}
  {% endif %}
  {% if post.url %}<li style="padding:5px;">{% if post.category == "speaking" %}<i class="fa fa-microphone"></i> {% endif %} <span class="post-meta pull-right">{{ post.date | date: "%d/%m/%Y" }}</span><a href="{{ post.url }}" title="{{post.title}}"> {{ post.title }}</a></li>{% endif%}
{% endfor %}
</ul>
</div><br/>
<p>
Subscribe <a href="{{ "/feed.xml" | prepend: site.baseurl }}">via RSS</a>
</p>

