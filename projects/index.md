---
layout: default
title: "Ayman Bagabas - Projects"
permalink: /projects/
---

## Top Projects
{% include top-projects.md %}

## Other Projects

{% for repository in site.github.public_repositories %}
* [{{ repository.name }}]({{ repository.html_url }}){:target="_blank"}\\
{{ repository.description }}
{% endfor %}
