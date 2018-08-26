---
layout: default
title: "Ayman Bagabas - Projects"
permalink: /projects/
---

# Projects

{% for repository in site.github.public_repositories %}
  * [{{ repository.name }}]({{ repository.html_url }}){:target="_blank"} - {{ repository.description }}
{% endfor %}

