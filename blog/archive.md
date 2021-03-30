---
title: " Archive"
layout: default
---

# Archive

{% comment %}
Stolen from https://stackoverflow.com/a/20777475/10913628
{% endcomment %}

{% for post in site.posts %}
  {% assign currentdate = post.date | date: "%Y" %}
  {% if currentdate != date %}
    {% unless forloop.first %}</ul>{% endunless %}
  <h3 id="year-{{post.date | date: "%Y"}}">{{ currentdate }}</h3>
  <ul>
    {% assign date = currentdate %}
  {% endif %}
  <li>
  <a href="{{ post.url }}">{{ post.title }}</a><small class='desc'> {{ post.date | date_to_string }}</small>
  </li>
  {% if forloop.last %}</ul>{% endif %}
{% endfor %}