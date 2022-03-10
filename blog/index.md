---
title: "Blog"
layout: page
sidebar_link: true
sidebar_sort_order: 2
---

{% comment %}
Stolen from https://stackoverflow.com/a/20777475/10913628
{% endcomment %}

{% for post in site.posts %}
  {% assign currentdate = post.date | date: "%Y" %}
  {% if currentdate != date %}
    {% unless forloop.first %}</ul>{% endunless %}
  <h3 id="year-{{post.date | date: "%Y"}}">{{ currentdate }}</h3>
  <ul class="posts-list">
    {% assign date = currentdate %}
  {% endif %}
  <li>
    <a href="{{ post.url | relative_url }}">
      {{ post.title }}
      <small>{{ post.date | date_to_string }}</small>
    </a>
  </li>
  {% if forloop.last %}</ul>{% endif %}
{% endfor %}