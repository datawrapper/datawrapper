export type GlobalDw = {
    backend: {
        __messages?: Record<string, Record<string, string>>;
        __api_domain?: string;
    };
};

export type WindowDw2 = {
    vis?: {
        meta?: {
            locale?: Record<string, string>;
        };
    };
};

export type BrowserWindow = {
    _paq: [string, ...unknown[]];
    dw: GlobalDw;
    __dw?: WindowDw2;
};

declare global {
    // Global variables can only be declared with `var`.
    // eslint-disable-next-line no-var
    var dw: GlobalDw;
}
