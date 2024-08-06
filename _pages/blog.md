---
layout: page
title: Articles
excerpt: Find here the listing of all blog entries and register for notifications on future updates
permalink: /blog/
---

<div>
  <ul class="no-list posts-list">
    {% for post in site.posts %}
      {% if post.url %}
        <article>
          <h2>
            <a href="{{ post.url }}" title="{{post.title}}">{{ post.title }}</a>
          </h2>
          <p>
            <span class="">{{ post.date | date: "%b %d, %Y" }}</span>
            {% if post.categories.size > 0 %}
            &middot;
            <span class="">{{ post.categories }}</span>
            {% endif %}
          </p>
          <p>{{ post.excerpt }}</p>
        </article>
      {% endif %}
    {% endfor %}
  </ul>
</div>
