
define(function() {

    return function(curPwd, pwd, pwd2) {
        var msg, errFields;
        if (curPwd === '') {
            errFields = '#cur-pwd';
            msg = dw.backend.messages.provideCurPwd;
        }
        else if (pwd.length < 4) {
            errFields = '#pwd';
            msg = dw.backend.messages.pwdTooShort;
        }
        else if (pwd != pwd2) {
            errFields = '#pwd,#pwd2';
            msg = dw.backend.messages.pwdMismatch;
        }
        if (msg) {
            dw.backend.logError(
                msg, $(errFields.split(',')[0]).parents('.control-group')
            );
            $(errFields).parents('.control-group').addClass('error');
            return false;
        }
        return true;
    };

});