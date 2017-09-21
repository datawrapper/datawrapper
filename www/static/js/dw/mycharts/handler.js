define(function(require) {
    return {
        fail: function(err) {
            alert('API Error');
            console.error(err);
        },
        done: function(res) {
            if (res.status == 'error') {
                alert(res.message);
            } else if (res.status == 'ok') {
                location.reload(true);
            }
        }
    };
});
