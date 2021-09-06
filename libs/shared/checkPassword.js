/* global dw */
const MIN_PASSWORD_LENGTH = 10;

/** @deprecated */
export default function checkPassword(curPwd, pwd, pwd2) {
    var msg;
    if (curPwd === '') {
        msg = dw.backend.messages.provideCurPwd;
    } else if (pwd.length < MIN_PASSWORD_LENGTH) {
        msg = dw.backend.messages.pwdTooShort.replace('%num', MIN_PASSWORD_LENGTH);
    } else if (pwd !== pwd2) {
        msg = dw.backend.messages.pwdMismatch;
    }
    if (msg) {
        return msg;
    }
    return false;
}
