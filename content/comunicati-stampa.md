---
layout: default
permalink: /comunicati-stampa/
sitemap: true
title: "Comunicati Stampa"
---
{% for item in site.comunicati-stampa %}
<div class="row">
    <div class="col">
        <a href="{{ item.url }}">{{ item.title }}</a>
    </div>
    <div class="col text-right">
        {{ item.date | date: "%d/%m/%Y" }}
    </div>
</div>
{% endfor %}
