import type { ThemeData } from './themeTypes';

export type DatePrecision =
    | 'year'
    | 'half'
    | 'quarter'
    | 'month'
    | 'week'
    | 'day'
    | 'day-minutes'
    | 'day-seconds';

export type NumberColumnFormatterConfig = {
    'number-format'?: string;
    'number-divisor'?: number | string;
    'number-append'?: string;
    'number-prepend'?: string;
};

export type DateColumnFormatterConfig = {
    normalizeDatesToEn?: boolean;
};

export type ColumnTypeExpanded = {
    format(): unknown;
    precision(): DatePrecision;
};

export type Column = {
    // Depending on column type, supported range is either [number, number] or [column, column].
    // Declaring it as [any, any] is the simplest way.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    range(): [any, any];
    name: () => string;
    value: (index: number) => string | number | boolean | null;
    values: () => (string | number | boolean | null)[];
    title: () => string;
    type(): 'text' | 'number' | 'date';
    type(expand: true): ColumnTypeExpanded;
};

export type Metadata = {
    // TODO Define the type of `axes`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    axes?: any;
    // TODO Define the type of `describe`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    describe?: any;
    // TODO Define the type of `visualize`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visualize?: any;
    // TODO Define the type of `annotate`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    annotate?: any;
    custom?: {
        webToPrint?: {
            mode?: string;
        };
    } & Record<`exif-${string}`, string>;
    data?: {
        'column-format'?: Record<string, Record<string, unknown>>;
        'column-order'?: number[];
        transpose?: boolean;
        'upload-method'?: 'external-data' | 'google-spreadsheet' | 'copy';
        'google-spreadsheet-src'?: string;
        'external-data'?: string;
        'external-metadata'?: string;
        changes?: {
            row: number;
            column: number;
            value: string | number;
            time?: number; // Date.now()
            previous?: string | number;
        }[];
    };
    publish?: {
        'embed-height'?: number;
        'embed-width'?: number;
    };
};

export type Overlay = {
    color: number | string;
    opacity: number | `${number}`;
};

export type TextDirection = 'rtl' | 'ltr';

export type Row = Record<string, string | number | boolean | null | Date>;

export type Dataset = {
    columns: () => Column[];
    column: (name: string | number) => Column;
    hasColumn: (name: string | number) => boolean;
    list: () => Row[];
    toCSV: () => string;
};

export type VisAxesColumns = Record<string, Column[]>;
export type VisAxesNames = Record<string, string[]>;

type AxesGetter = {
    (asColumns?: false): VisAxesNames;
    (asColumns: true): VisAxesColumns;
};

type SettingsGetter<TRoot> = {
    (): TRoot;
    <TDefault>(key: string, default_?: TDefault): TDefault;
};

export type RenderFlags = {
    allowEditing?: boolean;
    dark?: boolean | 'auto';
    dev?: boolean;
    fitchart?: boolean;
    logo?: string;
    logoId?: string;
    map2svg?: boolean;
    plain?: boolean;
    previewId?: string;
    search?: string;
    static?: boolean;
    svgonly?: boolean;
    theme?: string;
    transparent?: boolean;
};

export type ChartLibraries = {
    chroma: typeof import('chroma-js');
    numeral: typeof import('numeral');
    dayjs: typeof import('dayjs');
};

export type DwChart = {
    get: SettingsGetter<Chart>;
    set: (key: string, value: unknown) => void;
    load: (data: string) => void;
    flags: () => RenderFlags;
    libraries: () => ChartLibraries;
    emotion: typeof import('@emotion/css');
};

export type Chart = {
    id: string;
    publicId: string;
    language: string;
    theme: string;
    type: string;
    title: string;
    lastEditStep: number;
    publicUrl?: string;
    publicVersion?: number;
    metadata: Metadata;
    thumbnails?: {
        plain: string;
    };
    thumbnailHash: string;
    folderId?: number | null;
    organizationId: string | null;
};

export type Visualization = {
    dataset: Dataset;
    get: SettingsGetter<object>;
    theme: () => ThemeData;
    chart: () => DwChart;
    darkMode: () => boolean;
    axes: AxesGetter;
    libraries: () => ChartLibraries;
    addFilterUI: (args: {
        column: Column;
        type: 'auto' | 'select' | 'buttons' | 'timescale';
    }) => void;
    renderingComplete: () => void;
    size: () => [number, number];
    colorMap: () => (color: string) => string;
    colorMode: () => string;
    __lastRow: number;
    textDirection: TextDirection;
};
