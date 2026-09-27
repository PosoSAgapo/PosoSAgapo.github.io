---
layout: archive
permalink: /
title: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

{%- assign pubs = site.data.publications -%}
{%- assign all_pubs = pubs.conference | concat: pubs.journal | concat: pubs.preprint -%}
{%- assign selected = all_pubs | where_exp: "p", "p.selected == true" -%}

<section class="home-intro">
  <p class="home-intro__eyebrow">Researcher · Sony Group Corporation</p>
  <h1 class="home-intro__title">Hi, I'm Bowen Chen.</h1>
  <p class="home-intro__lead">
    I work on <strong>AI × Content Promotion</strong> at Sony Group Corporation.
    Previously, I obtained my Ph.D. from the Department of Computer Science at
    The University of Tokyo, where I was a member of
    <a href="https://mynlp.is.s.u-tokyo.ac.jp/ja/index">Miyao Lab</a>.
  </p>
  <div class="home-intro__actions">
    <a class="home-btn home-btn--primary" href="mailto:{{ site.author.email }}"><i class="fas fa-envelope" aria-hidden="true"></i> Email</a>
    <a class="home-btn" href="{{ '/publications/' | relative_url }}"><i class="fas fa-book" aria-hidden="true"></i> Publications</a>
    <a class="home-btn" href="{{ '/cv/' | relative_url }}"><i class="fas fa-file-alt" aria-hidden="true"></i> CV</a>
    <a class="home-btn" href="https://github.com/{{ site.author.github }}"><i class="fab fa-github" aria-hidden="true"></i> GitHub</a>
  </div>
</section>

<section class="home-section">
  <h2 class="pub-section__heading">Research</h2>
  <p>
    My research interests are in the field of Natural Language Processing,
    Machine Learning, and Deep Learning. The main focus of my research is LLM
    interpretability, especially regarding its memorization and generalization.
    I am also doing some research in LLM Agent applications, mainly in LLM
    Agent × Advertisement. Previously, I also had some experience in Semantic
    Parsing and Cognitive Science × NLP.
  </p>
</section>

{% include publication-list.html items=selected heading="Selected Publications" id="selected" %}

<p class="home-more"><a href="{{ '/publications/' | relative_url }}">All publications →</a></p>
