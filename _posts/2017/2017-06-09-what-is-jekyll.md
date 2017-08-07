---
layout: "post"
title: "What is Jekyll?"
date: "2017-06-09 18:12"
comments: true
---

 [Jekyll](https://jekyllrb.com/) is a static website builder, it assembeles and combines multiple pages to form one unified HTML page. Jekyll uses YAML language to organize the structure of the page. [Markdown](https://daringfireball.net/projects/markdown/) language, which is a text-to-HTML converter, makes webpages easy to write and adapt.

 Jekyll is writen in Ruby and can be installed using `gem`. On a Linux machine that already has Ruby installed, Jekyll can be installed as the following:

{% highlight shell %}
gem install jekyll bundler
jekyll new my-awesome-site
cd my-awesome-site
bundle exec jekyll serve
{% endhighlight %}

 Now you can visualize the page using [http://localhost:4000](http://localhost:4000)
