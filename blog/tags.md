---
title: "Tags"
layout: default
---

{% comment %}
=======================
Mainly stolen from https://codinfox.github.io/dev/2015/03/06/use-tags-and-categories-in-your-jekyll-based-github-pages/
=======================
{% endcomment %}
{% comment %}
=======================
The following part extracts all the tags from your posts and sort tags, so that you do not need to manually collect your tags to a place.
=======================
{% endcomment %}
{% assign rawtags = "" %}
{% for post in site.posts %}
  {% assign ttags = post.tags | join:'|' | append:'|' %}
  {% assign rawtags = rawtags | append:ttags %}
{% endfor %}
{% assign rawtags = rawtags | split:'|' | sort %}

{% comment %}
=======================
The following part removes dulpicated tags and invalid tags like blank tag.
=======================
{% endcomment %}
{% assign tags = "" %}
{% for tag in rawtags %}
  {% if tag != "" %}
    {% if tags == "" %}
      {% assign tags = tag | split:'|' %}
    {% endif %}
    {% unless tags contains tag %}
      {% assign tags = tags | join:'|' | append:'|' | append:tag | split:'|' %}
    {% endunless %}
  {% endif %}
{% endfor %}

{% comment %}
=======================
The purpose of this snippet is to list all the tags you have in your site.
=======================
{% endcomment %}

# Tags 

<p>
{% for tag in tags %}
[{{ tag }}](#{{ tag | slugify }})
{% endfor %}
</p>

{% comment %}
=======================
The purpose of this snippet is to list all your posts posted with a certain tag.
=======================
{% endcomment %}
{% for tag in tags %}

<h2 id="{{ tag | slugify }}">{{ tag }}</h2>

<ul>
   {% for post in site.posts %}
     {% if post.tags contains tag %}

<li><a href="{{ post.url }}">{{ post.title }}</a><small class='desc'> {{ post.date | date_to_string }}</small></li>

     {% endif %}
   {% endfor %}
</ul>

{% endfor %}

<!-- Display untagged posts -->
{% for post in site.posts %}
{% if post.tags.size == 0 %}

{% if forloop.first %}
<h2 id="untagged">untagged</h2>
<ul>
{% endif %}

<li><a href="{{ post.url }}">{{ post.title }}</a><small class='desc'> {{ post.date | date_to_string }}</small></li>

{% if forloop.last %}
</ul>
{% endif %}

{% endif %}
{% endfor %}