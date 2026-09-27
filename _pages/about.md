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
    My research lies in Natural Language Processing, Machine Learning and Deep
    Learning, with a focus on understanding how large language models learn.
  </p>
  <div class="home-topics">
    <div class="home-topic">
      <i class="fas fa-brain home-topic__icon" aria-hidden="true"></i>
      <h3 class="home-topic__title">LLM Interpretability</h3>
      <p class="home-topic__text">Memorization and generalization in large language models, from statistical behaviour to internal representations.</p>
    </div>
    <div class="home-topic">
      <i class="fas fa-robot home-topic__icon" aria-hidden="true"></i>
      <h3 class="home-topic__title">LLM Agents</h3>
      <p class="home-topic__text">Applying LLM agents to real-world problems, mainly advertising: keyword generation and ad creative generation.</p>
    </div>
    <div class="home-topic">
      <i class="fas fa-project-diagram home-topic__icon" aria-hidden="true"></i>
      <h3 class="home-topic__title">Earlier Work</h3>
      <p class="home-topic__text">Semantic parsing, task-oriented dialogue, and cognitive science × NLP.</p>
    </div>
  </div>
</section>

<section class="home-section">
  <h2 class="pub-section__heading">News</h2>
  <ul class="home-news">
    <li><span class="home-news__date">2026</span><span>Our paper <em>A Comparative Analysis of LLM Memorization at Statistical and Internal Levels</em> is accepted to the <strong>EMNLP 2026 Main Conference</strong>.</span></li>
    <li><span class="home-news__date">2025</span><span>Two papers accepted to <strong>EMNLP 2025</strong> (Main Conference and Industry Track).</span></li>
    <li><span class="home-news__date">2025</span><span>One paper accepted to the <strong>ACL 2025 Main Conference</strong>.</span></li>
    <li><span class="home-news__date">2024</span><span>One paper accepted to the <strong>EMNLP 2024 Main Conference</strong>.</span></li>
  </ul>
</section>

{% include publication-list.html items=selected heading="Selected Publications" id="selected" %}

<p class="home-more"><a href="{{ '/publications/' | relative_url }}">All publications →</a></p>
