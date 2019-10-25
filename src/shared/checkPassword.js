/* @DEPRECATED: plase use @datawrapper/shared instead */

/* global dw */
export default function(curPwd, pwd, pwd2) {
    var msg;
    if (curPwd === '') {
        msg = dw.backend.messages.provideCurPwd;
    } else if (pwd.length < 10) {
        msg = dw.backend.messages.pwdTooShort.replace('%num', 10);
    } else if (pwd !== pwd2) {
        msg = dw.backend.messages.pwdMismatch;
    }
    if (msg) {
        return msg;
    }
    return true;
}
