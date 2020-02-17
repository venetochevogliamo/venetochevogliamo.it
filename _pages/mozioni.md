---
layout: default
permalink: /mozioni/
sitemap: true
title: "Mozioni"
---

{% assign mozioni = site.pages | where: "category", "mozione" | sort: "published_at" | reverse %}

{% for item in mozioni %}

<div class="row">
    <div class="col">
        <a href="{{ item.permalink }}">{{ item.title }}</a>
    </div>
    <div class="col text-right">
        {{ item.published_at | date: "%d/%m/%Y" }}
    </div>
</div>
{% endfor %}
