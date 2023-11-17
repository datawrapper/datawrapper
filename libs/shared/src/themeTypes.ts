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

// TODO Some properties arae for sure missing in the `BlockStyles` type. Fill them.
type ThemeBlockStyles = {
    gap?: number;
    layout?: string;
    flexGrow?: number;
    maxWidth?: string;
    minWidth?: string;
    separator?: {
        margin?: string;
    };
    // TODO Define the type of the `tabs` property.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tabs?: any;
    typography?: {
        color?: string;
        fontSize?: number;
        fontWeight?: number | string;
        lineHeight?: number;
        typeface?: string;
        underlined?: boolean;
    };
};

type ThemeBlockData = {
    options?: {
        id?: string;
        title?: string;
        height?: number;
        imgSrc?: string;
    }[];
};

type ThemeBlock = {
    styles?: ThemeBlockStyles & {
        links?: ThemeBlockStyles;
    };
    data?: ThemeBlockData;
};

// TODO The `type` property should be `children?: Block[]`, but our type implementation in shared/get doesn't support recursive types yet.
export type Block = { id?: string; type?: string; children?: { id?: string; type?: string }[] };
export type Container = Block & { type: 'container'; children: Block[] };

type FontWeight =
    | 'bold'
    | 'bolder'
    | 'light'
    | 'lighter'
    | 'normal'
    | 'initial'
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900;
type TextTransform = 'uppercase' | 'capitalize' | 'lowercase' | 'full-width' | 'none';
type TypographyObject = {
    color?: string;
    fontSize?: number;
    fontWeight?: FontWeight;
    typeface?: string;
    lineHeight?: number;
    textTransform?: TextTransform;
    letterSpacing?: string;
};
type StrokeLineCap = 'butt' | 'round' | 'square';
type LineWidthStyle = 'style0' | 'style1' | 'style2' | 'style3';

export type ThemeData = {
    type?: 'web' | 'print';
    blocks?: Record<string, ThemeBlock>;
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
    vis?: {
        'multiple-lines'?: {
            panels?: {
                title?: TypographyObject;
                titleSpace?: number;
                columnGap?: number;
                rowGap?: number;
            };
            extendGrid?: boolean;
            mobileBreakpoint?: number;
            lines?: {
                defaultWidthStyle?: {
                    main?: LineWidthStyle;
                    repeat?: LineWidthStyle;
                };
                linecap?: {
                    normal?: StrokeLineCap;
                    dashed?: StrokeLineCap;
                };
                widths?: {
                    style0?: number;
                    style1?: number;
                    style2?: number;
                    style3?: number;
                };
            };
        };
    };
};

/**
 * @deprecated Please use ThemeData instead
 */
export type Theme = ThemeData;
