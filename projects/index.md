---
layout: default
title: "Projects"
---

# Projects

<ul>
{% for repository in site.github.public_repositories %}
<li>
<a rel="noopener" rel="noreferrer" href="{{ repository.html_url }}" target="_blank">{{ repository.name }}</a>
<p>{{ repository.description }}</p>
</li>
{% endfor %}
<ul>
