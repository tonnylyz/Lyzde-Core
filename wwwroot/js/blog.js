
$(function () {
    var tags = [];
    $.get("/Ajax/Blog/ListDetail",
        function (list) {
            var template = '<a href="/post/{id}.html" data-id="{id}" class="card post-item mt-4">\n' +
                '                <div class="card-body">\n' +
                '                    <h5 class="card-title">{title}</h5><h6 class="card-subtitle mb-2 text-muted"{datetime}</h6>\n' +
                '                    <p class="card-text">{description}</p>\n' +
                '                </div>\n' +
                '                <div class="card-footer">\n' +
                '                    <small class="text-muted"><i data-feather="eye"></i> {view} &nbsp;  {tag}</small>\n' +
                '                </div>\n' +
                '            </a>';
            $("#blog-list-container").empty();
            for (var i = 0; i < list.length; i++) {
                var tagArray = list[i].tag.split('|');
                var tagHtml = '';
                for (var j = 0; j < tagArray.length; j++) {
                    if (tagArray[j].trim().length === 0) continue;
                    tags.push(tagArray[j]);
                    tagHtml += '<span class="badge badge-pill badge-secondary mr-1">' + tagArray[j] + '</span>';
                }

                $("#blog-list-container").append(template
                    .replace("{id}", list[i].id)
                    .replace("{description}", list[i].description)
                    .replace("{view}", list[i].viewCount)
                    .replace("{tag}", tagHtml)
                    .replace("{datetime}", '<abbr title="'+ moment(list[i].datetime).format('MMMM Do YYYY, h:mm:ss a') + '">' +
                        moment(list[i].datetime).fromNow() +
                        '</abbr>')
                    .replace("{title}", list[i].title));
            }

            feather.replace();
            $("#blog-list-container").css("opacity", 1);
        });

});