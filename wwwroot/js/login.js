function error(title, msg) {
    new PNotify({
        title: title,
        text: msg,
        type: 'error'
    });
}

$("#login-form").submit(function (e) {
    e.preventDefault();
    $.ajax({
        url: "Ajax/Admin/Login",
        method: "post",
        data: $("#login-form").serializeArray(),
        success: function () {
            window.location.href = "admin.html";
        },
        error: function () {
            $("#login-form")[0].reset();
            error("Login failed", "Invalid credentials.");
        }
    });
});
