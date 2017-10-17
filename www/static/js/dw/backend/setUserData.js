define(function() {

    return function(data) {
        $.ajax({
            url: '/api/user/data',
            type: 'POST',
            data: JSON.stringify(data),
            dataType: 'json',
            context: this,
            success: function(res) {
                if (res.status == 'ok') {
                    _.each(data, function(value, key) {
                        // update client data
                        dw.backend.__userData[key] = value;
                    });
                }
            }
         });
        return true;
    };

});