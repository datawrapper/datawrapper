export type Typography = {
    fontFamilies: Record<
        string,
        {
            name: string;
            weight: number;
            style: string;
        }[]
    >;
};

export type FontObject = {
    family: string;
    props: {
        weight: number;
        style: string;
    };
};

/* TODO:
 * in theory this* should be  children?: Block[], but our type implementation in shared/get
 * does not permit recursive types, yet
 */ //                                     *⤵
export type Block = { id?: string; type?: string; children?: { id?: string; type?: string }[] };
export type Container = Block & { type: 'container'; children: Block[] };

export type ThemeData = {
    blocks?: Record<string, { styles: any; options: any }>;
    regions?: {
        header?: Container;
        footer?: Container;
        bodyLeft?: Container;
        bodyRight?: Container;
        afterChart?: Block[];
    };
    colors?: {
        background?: string;
        bgBlendRatios?: {
            axis?: number;
            gridline?: number;
            series?: number;
            tickText?: {
                primary?: number;
                secondary?: number;
            };
            value?: number;
        };
        chartContentBaseColor?: string;
        general?: {
            background?: string;
            padding?: number;
        };
        palette?: string[];
    };
    easing?: string;
    typography?: {
        chart?: {
            fontSize?: number;
        };
    };
};

/**
 * @deprecated Please use ThemeData instead
 */
export type Theme = ThemeData;
