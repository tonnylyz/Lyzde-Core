function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

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


var blogId = 0;

$(function () {
    blogId = getParameterByName("id");
    if (!blogId) {
        blogId = 0;
    }

    $.get("Ajax/Blog/Content/" + blogId,
        function (article) {
            blogId = article.id;

            $("#blog-title").html(article.title);
            $("#blog-description").html(article.description);
            $("#blog-view").html(article.viewCount);
            $("#blog-comment").html(article.comments.length);
            $("#blog-datetime").html(moment(article.datetime).fromNow());

            var tag = article.tag.split('|');
            $("#blog-tag").empty();
            for (var i = 0; i < tag.length; i++) {
                if (tag[i] == "") continue;
                $("#blog-tag")
                    .append('<span class="badge badge-pill badge-dark">{tag}</span>'.replace("{tag}", tag[i]));
            }
            var commentTemplate =
                '<div class="list-group-item list-group-item-action flex-column align-items-start">' +
                '               <div class="d-flex w-100 justify-content-between">' +
                '                       <h5 class="mb-1">{subject}</h5>' +
                '                       <small>{datetime}</small>' +
                '                   </div>' +
                '                   <p class="mb-1">{content}</p>' +
                '                   <small>{author}</small>' +
                '               </div>';

            $("#blog-comment-container").empty();
            for (var i = 0; i < article.comments.length; i++) {
                $("#blog-comment-container").prepend(
                    commentTemplate
                        .replace("{subject}", article.comments[i].subject)
                        .replace("{datetime}", moment(article.comments[i].datetime).fromNow())
                        .replace("{content}", article.comments[i].content)
                        .replace("{author}", article.comments[i].author)
                );
            }
            if (article.comments.length > 0) {
                $("#blog-comment-empty").hide();
            }

            var converter = new showdown.Converter();
            $("#blog-content").html(converter.makeHtml(article.content));
        });

    $.get("Ajax/Blog/List",
        function (list) {
            var template = '<a class="list-group-item list-group-item-action" href="blog.html?id={id}">{title}</a>';
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
