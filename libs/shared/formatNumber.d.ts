/// <reference types="typescript" />
declare function formatNumber(numeral: any, input: number, options: FormatOptions): string;
    
interface FormatOptions {
    format?: string;
    prepend?: string;
    append?: string;
    minusChar?: string;
    multiply?: number;
}

export = formatNumber;