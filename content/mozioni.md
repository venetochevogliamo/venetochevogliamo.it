---
layout: default
permalink: /mozioni/
sitemap: true
title: "Mozioni"
---
{% for item in site.mozioni %}
<div class="row">
    <div class="col">
        <a href="{{ item.url }}">{{ item.title }}</a>
    </div>
    <div class="col text-right">
        {{ item.date | date: "%d/%m/%Y" }}
    </div>
</div>
{% endfor %}
