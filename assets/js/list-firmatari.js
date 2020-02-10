$("#pagination-container").pagination({
  dataSource: function(done) {
    $.ajax({
      type: "GET",
      dataType: "json",
      url:
        "https://raw.githubusercontent.com/venetochevogliamo/venetochevogliamo.it/master/_data/appello-firmatari.json",
      success: function(response) {
        done(response);
      }
    });
  },
  pageSize: 250,
  callback: function(response, pagination) {
    var html = '<ul class="list-inline">';
    $.each(response, function(index, item) {
      html +=
        '<li class="list-inline-item">' +
        item.nome +
        " <small><i>" +
        item.comune +
        "</i></small></li>";
    });

    html += "</ul>";
    $("#data-container").html(html);
  }
});
