---
layout: archive
title: ""
permalink: /photos/
author_profile: true
---

{% assign albums = site.albums | sort: 'date' | reverse %}

{% for post in albums %}
  {% include album-card.html post=post %}
{% endfor %}
