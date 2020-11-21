---
layout: default
title: Ayman Bagabas
comments: false
---

**Hello there...**

My name is Ayman Bagabas. I'm a software developer who cares about open source projects, a coffee addict, and a traveler. I like coding, playing music, and biking. Oh, and cats :cat:!

## Top Projects
{% include top-projects.md %}

## Recent Posts

{% for post in site.posts limit: 3 %}
* [{{ post.title }}]({{ post.url | relative_url }}) - <small>[ <i>{{ post.date | date_to_string }}</i> ]</small>
	{{ post.excerpt | strip | remove_first: '</p>' }} <a href='{{ post.url | relative_url }}'>Read more...</a></p>
{% endfor %}
