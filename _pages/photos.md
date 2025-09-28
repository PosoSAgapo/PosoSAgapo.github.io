---
layout: archive
title: "Travel Albums"
permalink: /photos/
author_profile: true
---

{% assign albums = site.albums | sort: 'date' | reverse %}

{% for post in albums %}
  {% include archive-single.html type="grid" %}
{% endfor %}
