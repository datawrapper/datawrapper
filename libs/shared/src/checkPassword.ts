import { GlobalDw2 } from './browserGlobals';

declare const dw: GlobalDw2;

const MIN_PASSWORD_LENGTH = 10;

/** @deprecated */
export = function checkPassword(curPwd: string, pwd: string, pwd2: string) {
    let msg;
    if (curPwd === '') {
        msg = dw.backend.messages.provideCurPwd;
    } else if (pwd.length < MIN_PASSWORD_LENGTH) {
        msg = dw.backend.messages.pwdTooShort.replace('%num', MIN_PASSWORD_LENGTH.toString());
    } else if (pwd !== pwd2) {
        msg = dw.backend.messages.pwdMismatch;
    }
    if (msg) {
        return msg;
    }
    return false;
};
