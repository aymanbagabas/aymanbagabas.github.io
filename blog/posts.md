---
title: "Ayman Bagabas - Index"
layout: default
---

# Index

{% for post in site.posts %}
* [{{ post.title }}]({{ post.url | relative_url }}) - <small>[ <i>{{ post.date | date_to_string }}</i> ]</small>
	{{ post.excerpt | strip | remove_first: '</p>' }} <a href='{{ post.url | relative_url }}'>Read more...</a></p>
{% endfor %}
