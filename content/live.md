---
layout: page-without-header
permalink: /live/
sitemap: true
title: "In Piazza"
youtube-video: yM8miewWslU
---

<div style="background: url(/assets/img/inpiazza.jpg);
            height: 200px;
            background-size: 200px;
            background-repeat: no-repeat;
            background-position: center center;">
</div>
<div class="container">
  <div class="row justify-content-md-center py-3">
   <div class="col col-md-8">
     <!-- <div class="embed-responsive embed-responsive-16by9">
       <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/{{ page.youtube-video }}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div> -->
      <div class="p-5 mb-2 bg-warning">
        <a href="https://www.youtube.com/watch?v={{ page.youtube-video }}" onclick="ga('send', 'event', 'link', 'click', 'Live', 1)">
          <h5 class="text-white"><i class="fas fa-play-circle"></i> Guarda la diretta su YouTube</h5>
        </a>
      </div>
    </div>
  </div>
</div>
