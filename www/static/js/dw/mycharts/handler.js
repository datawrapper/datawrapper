define(function () {
    return {
        fail: function (err) {
            alert('API Error');
            console.error(err);
            location.reload();
        },
        done: function (res) {
            if (res.status == 'error') {
                alert(res.message);
            } else if (res.status == 'ok') {
                location.reload(true);
            }
        }
    };
});
