---
layout: tags
title: Archive
sidebar_link: true
sidebar_sort_order: 2
---

{% comment %}
Stolen from https://stackoverflow.com/a/20777475/10913628
{% endcomment %}

{% for post in site.posts %}
  {% assign currentdate = post.date | date: "%Y" %}
  {% if currentdate != date %}
    {% unless forloop.first %}
  </ul>
  <hr/>
	{% endunless %}
  <h2 id="{{post.date | date: "%Y"}}">{{ currentdate }}</h2>
  <ul class="posts-list">
    {% assign date = currentdate %}
  {% endif %}
  <li>
    <h3>
      <a href="{{ post.url | relative_url }}">
        {{ post.title }}
        <small>{{ post.date | date_to_string }}</small>
      </a>
    </h3>
  </li>
  {% if forloop.last %}
  </ul>
  {% endif %}
{% endfor %}
