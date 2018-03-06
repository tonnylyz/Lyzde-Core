$(function () {
    feather.replace();
    $.get("/Ajax/Admin/VisitData",
        function (result) {
            var count = result.count;
            var vlabels = [];
            var vdata = [];
            for (var ci = 0; ci < count.length; ci++) {
                var vdate = moment(count[ci].date).format("MMM Do YY");
                var vcount = count[ci].count;
                vlabels.push(vdate);
                vdata.push(vcount);
            }

            var ctx = document.getElementById("myChart");
            var viewChart = new Chart(ctx,
                {
                    type: 'line',
                    data: {
                        labels: vlabels,
                        datasets: [
                            {
                                data: vdata,
                                lineTension: 0,
                                backgroundColor: 'transparent',
                                borderColor: '#007bff',
                                borderWidth: 4,
                                pointBackgroundColor: '#007bff'
                            }
                        ]
                    },
                    options: {
                        scales: {
                            yAxes: [
                                {
                                    ticks: {
                                        beginAtZero: false,
                                        callback: function (value, index, values) {
                                            if (Math.floor(value) === value) {
                                                return value + 'PV';
                                            }
                                            return null;
                                        }
                                    }
                                }
                            ]
                        },
                        legend: {
                            display: false
                        }
                    }
                });


            var log = result.log;
            var parser = new UAParser();
            for (var i = 0; i < log.length; i++) {
                parser.setUA(log[i].UserAgent);
                var ua = parser.getResult();
                var displayInfo = [
                    ua.browser.name,
                    ua.browser.version,
                    "|",
                    ua.engine.name,
                    ua.engine.version,
                    "|",
                    ua.os.name,
                    ua.os.version,
                    ua.cpu.architecture,
                    "|",
                    ua.device.model ? ua.device.model : 'NIL',
                    ua.device.type ? ua.device.type : 'NIL',
                    ua.device.vendor ? ua.device.vendor : 'NIL'
                ];
                $("#visit-log-container").append(
                    '<tr><td>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td><td>{5}</td><td>{6}</td></tr>'
                        .replace("{1}", log[i].Id)
                        .replace("{2}",
                        '<abbr title="' +
                        moment(log[i].Datetime).format('MMMM Do YYYY, h:mm:ss a') +
                        '">' +
                        moment(log[i].Datetime).fromNow() +
                        '</abbr>')
                        .replace("{3}", displayInfo.join(' '))
                        .replace("{4}", log[i].Url.replace(/(http|https):\/\/(.*)\//, ""))
                        .replace("{5}", log[i].IPString)
                        .replace("{6}", log[i].Operation)
                );
            }


        });

    window.onbeforeunload = function () { 
        if (article_editor_changed) {
            return "Are you sure to leave this page with unsaved content?";
        }
        return null;
    };
    
    article_list_load();
    
    $.get("/Ajax/Admin/CommentList", function (data) {
        for (var i = 0; i < data.length; i++) {
            var tr_class = "";
            if (data[i].status === 0) {
                tr_class = "table-success";
            } else if (data[i].status === 2) {
                tr_class = "table-dark";
            }
            $("#admin-comment-container").append('<tr class="' + tr_class + '" data-id="' + data[i].id + '">\n' +
                '                        <th scope="row">' + data[i].id + '</th>\n' +
                '                        <td>' + data[i].title + '</td>\n' +
                '                        <td>' + data[i].subject + '</td>\n' +
                '                        <td>' + data[i].content + '</td>\n' +
                '                        <td>' + data[i].author + ' (' + data[i].email + ')</td>\n' +
                '                        <td><abbr title="' +
                                            moment(data[i].datetime).format('MMMM Do YYYY, h:mm:ss a') +
                                            '">' +
                                            moment(data[i].datetime).fromNow() +
                                            '</abbr></td>\n' +
                '                        <td class="py-0">' + '<div class="btn-group btn-group-sm mt-2" role="group" aria-label="Basic example">\n' +
                                        '  <button type="button" class="btn btn-success" onclick="comment_approve(this)">Approve</button>\n' +
                                        '  <button type="button" class="btn btn-danger" onclick="comment_spam(this)">Spam</button>\n' +
                                        '</div>' +'</td>\n' +
                '                    </tr>');
        }        
    });
});

function log_out() {
    $.get("/Ajax/Admin/Logout", function() {
        window.location.href = "login.html";
    });
}

var admin_sections = {
    dashboard : "dashboard",
    visit: "visit",
    article: "article",
    comment: "comment"
};

Object.freeze(admin_sections);

var admin_current_section = admin_sections.dashboard;

$("#admin-menu").children().each(function () {
    $(this).find("a").click(function (e) {
        e.preventDefault();
        var section = $(this).data("section");
        if (section === admin_current_section) {
            return;
        }
        $("#admin-menu").find(".active").removeClass("active");
        $(this).addClass("active");
        
        admin_current_section = section;
        $("section").each(function () {
            if ($(this).data("section") === section && section === admin_sections.article) {
                $(this).css("display", "flex");
            } else if ($(this).data("section") === section) {
                $(this).css("display", "block");
            } else {
                $(this).css("display", "none");
            }
        });
    })
});





function article_list_load() {
    $.get("/Ajax/Blog/List",
        function (list) {
            var template = '<a class="list-group-item list-group-item-action px-1" href="#" data-id="{id}" onclick="article_content_load(this); return false;">{title} <span onclick="article_delete(this)" class="badge badge-danger">&times;</span></a>';
            var al = $("#admin-article-list");
            al.empty();
            al.css("opacity", 0);
            for (var i = 0; i < list.length; i++) {
                al.append(template
                    .replace("{id}", list[i].id)
                    .replace("{title}", list[i].title));
            }
            al.css("opacity", 1);
        });
}

function article_delete(o) {
    confirm("Delete this article?", "This operation can NOT be reverted, be careful!",
    function () {
        $.get("/Ajax/Admin/ArticleDelete/" + $(o).parent().data("id"), function () {
            success("Delete succeeded", "The article has been deleted.");
            article_list_load();
            article_editor_changed = false;
            article_current_edit = null;
            article_editor_discard(function () {}, function () {});
        }).fail(function(rsp) {
            error("Delete failed", "Unable to delete this article, more info: " + rsp.responseText);
        });
    }, function() {
        
    });
}

var article_form = $("#article-form");
article_form.submit(function (e) {
    e.preventDefault();
    $.ajax({
        url: "/Ajax/Admin/ArticleSubmit",
        method: "post",
        data: $("#article-form").serializeArray(),
        success: function () {
            article_editor_changed = false;
            article_amb();
            article_list_load();
            success("Submit Succeeded", "Check it on the public site!")
        },
        error: function (data) {
            if (!data) data = "";
            error("Submit Failed", "Please check your inputs. " + data);
        }
    });
});

const article_status_default = 0;
const article_status_edit = 1;
const article_status_new = 2;
var article_status = article_status_default;

var article_editor_changed = false;
article_form.find(":input").change(function() {
    article_editor_changed = true;
});


var article_current_edit;

function article_edit(o) {
    if (article_current_edit !== o) {
        article_current_edit = o;
    } else {
        return;
    }
    var amb = $("#article-main-button");
    amb.html("Discard");
    amb.removeClass("btn-info");
    amb.addClass("btn-danger");

    var id = $(o).data("id");
    $(o).parent().children().removeClass("list-group-item-info");
    $(o).addClass("list-group-item-info");
    var form = $("#article-form");
    $.get("/Ajax/Admin/ArticleContent/" + id, function (article) {
        form.find("input[name='id']").val(article.id);
        form.find("input[name='title']").val(article.title);
        form.find("input[name='datetime']").val(moment(article.datetime).format('YYYY-MM-DD HH:mm Z'));
        form.find("input[name='description']").val(article.description);
        form.find("input[name='viewCount']").val(article.viewCount);
        form.find("textarea[name='content']").val(article.content);
        form.find("input[name='tag']").val(article.tag);
        article_live_preview();
        article_editor_changed = false;
    });
}

function article_content_load(o) {
    if (article_current_edit === o) {
        return;
    }
    article_editor_discard(function () {
        article_status = article_status_edit;
        article_edit(o);
    }, function () {

    });
}

function article_live_preview() {
    var content = $("#article-editor").val();
    if (content.trim() !== "") {
        var converter = new showdown.Converter();
        $("#admin-article-preview").html(converter.makeHtml(content.trim()));
    } else {
        $("#admin-article-preview").html('<h1 class="text-muted text-center">Live Preview</h1>');
    }
}

function article_editor_discard(ok, cancel) {
    if (article_status === article_status_default || article_editor_changed === false) {
        ok();
        return;
    }
    confirm(
        "Discard current work?",
        "It seems that you have edit some inputs, are you sure to discard them?",
        function (){
            ok();
            article_editor_changed = false;
        }, function (){
            cancel();
        });
}

function article_amb() {
    var form = $("#article-form");
    var amb = $("#article-main-button");
    console.log(article_status);
    switch (article_status) {
        default:
        case article_status_default:
            amb.html("Discard");
            amb.removeClass("btn-info");
            amb.addClass("btn-danger");
            form[0].reset();
            form.find("input[name='id']").val(-1);
            form.find("input[name='datetime']").val(moment().format());
            article_live_preview();
            article_status = article_status_new;
            article_editor_changed = false;
            break;
        case article_status_edit:
            article_editor_discard(function () {
                $("#admin-article-list").children().removeClass("list-group-item-info");

                amb.html("New");
                amb.removeClass("btn-danger");
                amb.addClass("btn-info");
                form[0].reset();
                article_live_preview();
                article_status = article_status_default;
                article_current_edit = null;
            }, function () {
                
            });
            break;
        case article_status_new:
            article_editor_discard(function () {

                amb.html("New");
                amb.removeClass("btn-danger");
                amb.addClass("btn-info");
                form[0].reset();
                article_live_preview();
                article_status = article_status_default;
                
            }, function () {
                
            });
            break;
    }
}

function comment_approve(o) {
    var tr = $(o).parent().parent().parent();
    var comment_id = tr.data("id");
    $.get("/Ajax/Admin/CommentApprove/" + comment_id, function () {
        tr.removeClass("table-dark");
        tr.addClass("table-success");
    });
}

function comment_spam(o) {
    var tr = $(o).parent().parent().parent();
    var comment_id = tr.data("id");
    $.get("/Ajax/Admin/CommentSpam/" + comment_id, function () {
        tr.removeClass("table-success");
        tr.addClass("table-dark");
    });
}

function success(title, msg) {
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

function confirm(title, msg, ok, cancel) {
    (new PNotify({
        title: title,
        text: msg,
        hide: false,
        confirm: {
            confirm: true
        },
        buttons: {
            closer: false,
            sticker: false
        },
        history: {
            history: false
        },
        stack: {
            'dir1': 'down',
            'dir2': 'right',
            'modal': true
        }
    })).get().on('pnotify.confirm', function() {
        ok();
    }).on('pnotify.cancel', function() {
        cancel();
    });
}