function info(title, msg) {
    new PNotify({
        title: title,
        text: msg,
        type: 'success'
    });
}

function error(title, msg) {
    new PNotify({
        title: title,
        text: msg,
        type: 'error'
    });
}

function info(title, msg) {
    new PNotify({
        title: title,
        text: msg,
        type: 'info'
    });
}

$(function () {
    $(".human-time").each(function () {
        $(this).html(moment($(this).attr("title")).fromNow())
    });
    
    var converter = new showdown.Converter();
    $("#blog-content").html(converter.makeHtml($("#blog-content-md").html()));

    $.get("Ajax/Blog/List",
        function (list) {
            var template = '<a class="list-group-item list-group-item-action" href="post/{id}.html">{title}</a>';
            $("#blog-list").empty();
            for (var i = 0; i < list.length; i++) {
                $("#blog-list").append(template
                    .replace("{id}", list[i].id)
                    .replace("{title}", list[i].title));
            }
        });
});

$("#comment-form").submit(function (e) {
    e.preventDefault();
    $.ajax({
        url: "Ajax/Blog/Comment/" + blogId,
        method: "post",
        data: $("#comment-form").serializeArray(),
        success: function () {
            success("Submit success", "Your comment will be checked and shown.");
            $("#comment-form")[0].reset();
        },
        error: function () {
            error("Submit error", "Comment submit error. Please try later.");
        }
    });
});
