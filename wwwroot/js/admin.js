$(function () {
    feather.replace();
    $.get("Ajax/Admin/VisitData",
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
                            display: false,
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
});

function log_out() {
    $.get("Ajax/Admin/Logout", function() {
        window.location.href = "login.html";
    });
}