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

export type Theme = {
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
