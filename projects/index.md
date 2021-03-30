---
layout: default
title: "Projects"
---

# Projects

<ul>
{% for repository in site.github.public_repositories %}
<li>
<a href="{{ repository.html_url }}" target="_blank">{{ repository.name }}</a>
<p>{{ repository.description }}</p>
</li>
{% endfor %}
<ul>
