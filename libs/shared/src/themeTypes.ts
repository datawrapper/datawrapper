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

export type V1TextBlockConfig = V1BlockConfig & {
    data?: CustomBlockData;
};

export type V1HTMLRuleBlockData = {
    border?: string;
    margin?: string;
};

export type V1HTMLRuleBlockConfig = V1BlockConfig & {
    data?: V1HTMLRuleBlockData;
};

export type V2Margin =
    | {
          top?: number;
          right?: number;
          bottom?: number;
          left?: number;
      }
    | string;

export type HTMLRuleStyles = {
    width?: number;
    color?: string;
    style?: string;
    margin?: V2Margin;
};

export type V1SVGRuleBlockConfig = V1BlockConfig & {
    data?: unknown;
};

export type V1RectangleBlockConfig = V1BlockConfig & {
    data?: {
        width?: number;
        height?: number;
        fill?: string;
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

export type ThemeBlock = {
    styles?: ThemeBlockStyles & {
        links?: ThemeBlockStyles;
    };
    options?: Record<string, unknown>;
};

// TODO The `type` property should be `children?: Block[]`, but our type implementation in shared/get doesn't support recursive types yet.
export type Block = {
    type: string;
    id?: string;
    children?: {
        id?: string;
        type: string;
        children?: {
            id?: string;
            type: string;
            children?: {
                id?: string;
                type: string;
                children?: { id?: string; type: string }[];
            }[];
        }[];
    }[];
};
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

export type ThemeBlockType =
    | 'text'
    | 'ruleHTML'
    | 'ruleSVG'
    | 'logo'
    | 'container'
    | 'rectangle'
    | 'headline'
    | 'description'
    | 'notes'
    | 'byline'
    | 'source'
    | 'mapAttribution'
    | 'getTheData'
    | 'edit'
    | 'embed'
    | 'downloadImage'
    | 'downloadPdf'
    | 'downloadSvg'
    | 'attribution'
    | 'shareTools'
    | 'watermark';

export type V1BlockConfig = {
    region?:
        | 'header'
        | 'belowHeader'
        | 'headerRight'
        | 'footerLeft'
        | 'footerCenter'
        | 'footerRight'
        | 'aboveFooter'
        | 'belowFooter'
        | 'afterBody'
        | 'menu';
    priority?: number;
    prepend?: string;
    append?: string;
    data?: Record<string, unknown>;
};

export type V1BlockType =
    | 'hr'
    | 'hr1'
    | 'hr2'
    | 'svg-rule'
    | 'svg-rule1'
    | 'svg-rule2'
    | 'rectangle'
    | 'figure'
    | 'headline'
    | 'description'
    | 'subhed'
    | 'logo'
    | 'figure'
    | 'subhed'
    | 'caption'
    | 'copyright'
    | 'timestamp'
    | 'custom'
    | 'custom1'
    | 'custom2'
    | 'custom3'
    | 'notes'
    | 'map-attribution'
    | 'byline'
    | 'source'
    | 'get-the-data'
    | 'edit'
    | 'embed'
    | 'download-image'
    | 'download-pdf'
    | 'download-svg'
    | 'attribution'
    | 'social-sharing'
    | 'watermark';

type CustomBlockData = {
    'custom-field'?: string;
};

type StyleObject = {
    border?: { top?: string; bottom?: string; left?: string; right?: string };
    background?: string;
    margin?: string;
    padding?: string;
    textAlign?: string;
};
type FooterRegionOptions = {
    gap?: number;
    layout?: 'flex-row' | 'flex-column' | 'inline';
};

export type Override = {
    type?: 'darkMode';
    condition?: any[];
    settings: Record<string, string>;
};

export type ThemeData = {
    type?: 'web' | 'print';
    blocks?: Record<string, ThemeBlock>;
    overrides?: Override[];
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
        chart?: TypographyObject;
        notes?: TypographyObject;
        footer?: TypographyObject;
        headline?: TypographyObject;
        description?: TypographyObject;
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
    style?: {
        header?: StyleObject & {
            title?: StyleObject;
            description?: StyleObject;
        };
        footer?: StyleObject;
        notes?: StyleObject;
        aboveFooter?: StyleObject;
        belowFooter?: StyleObject;
        filter?: unknown;
    };
    options?: {
        blocks?: Record<string, V1BlockConfig>;
        footer?: {
            left?: FooterRegionOptions;
            center?: FooterRegionOptions;
            right?: FooterRegionOptions;
            gap?: number;
            separator?: {
                margin?: string;
                text?: string;
            };
        };
    };
    export?: {
        [key in 'pdf' | 'svg']?: Record<string, unknown>;
    };
    locales?: Record<string, Record<string, string>>;
    defaultFooterRegion?: string;
    defaultHeaderRegion?: string;
};

/**
 * @deprecated Please use ThemeData instead
 */
export type Theme = ThemeData;
