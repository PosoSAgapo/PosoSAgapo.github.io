---
layout: archive
permalink: /
title: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---



I am a PhD student at the University of Tokyo, Department of Computer Science, [Miyao Lab](https://mynlp.is.s.u-tokyo.ac.jp/ja/index).  

---

My research interests are in the field of Natural Language Processing, Machine Learning, and Deep Learning. 
The main focus of my research is LLM analysis and its interpretability, especially regarding its memorization and generalization. Previously, I also had some experience in Semantic Parsing and Cognitive Science X NLP.  

---

I don't really maintain this site very often, reach me via email if you have any questions.






---

Latest Photos

{% assign gallery = site.pages | where: "permalink", "/photos/" | first %}
{% if gallery and gallery.gallery %}
{% include gallery id="gallery" caption="See more in Photos →" %}
{% else %}
<p>Visit the <a href="/photos/">Photos</a> page to see albums.</p>
{% endif %}
