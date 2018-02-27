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

    article_list_load();    
});

function log_out() {
    $.get("/Ajax/Admin/Logout", function() {
        window.location.href = "login.html";
    });
}

$("#article-form").submit(function (e) {
    e.preventDefault();
    $.ajax({
        url: "/Ajax/Admin/ArticleSubmit",
        method: "post",
        data: $("#article-form").serializeArray(),
        success: function () {
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

function article_list_load() {
    $.get("/Ajax/Blog/List",
        function (list) {
            var template = '<a class="list-group-item list-group-item-action" href="#" data-id="{id}" onclick="article_content_load(this); return false;">{title}</a>';
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

function article_content_load(o) {
    if (article_status !== article_status_default) {
        error("Save current work?", "Your need to discard or submit your current work to edit another.");
        return;
    }
    article_status = article_status_edit;

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
    })
    
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

function article_amb() {
    var amb = $("#article-main-button");
    var form = $("#article-form");
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
            break;
        case article_status_edit:
            $("#admin-article-list").children().removeClass("list-group-item-info");
        case article_status_new:
            amb.html("New");
            amb.removeClass("btn-danger");
            amb.addClass("btn-info");
            form[0].reset();
            form.find("input[name='id']").val(-1);
            article_live_preview();
            article_status = article_status_default;
            break;
    }
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
