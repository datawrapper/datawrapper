/* global dw */
export default function(curPwd, pwd, pwd2) {
    var msg;
    if (curPwd === '') {
        msg = dw.backend.messages.provideCurPwd;
    } else if (pwd.length < 4) {
        msg = dw.backend.messages.pwdTooShort;
    } else if (pwd !== pwd2) {
        msg = dw.backend.messages.pwdMismatch;
    }
    if (msg) {
        return msg;
    }
    return true;
}
