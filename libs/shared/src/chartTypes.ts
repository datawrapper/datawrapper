import type { Writable } from 'svelte/store';
import type { ThemeData } from './themeTypes.js';
import type { PostEvent } from './postEvent.js';

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
    raw(index?: number, value?: unknown): string;
    /**
     * @param index - row index
     * @param unchanged - if true, returns the data without the changes made in 'check & describe'
     */
    val(index: number, unchanged?: boolean): unknown;
    each(callback: (value: string | number | boolean | null, index: number) => void): void;
    rows: () => (string | number | boolean | null)[];
    clone: () => Column;
    /**
     * @param index - row index
     * @returns the specified row formatted for use as a key
     */
    key(index: number): string;
    /**
     * @returns all values formatted for use as keys
     */
    keys(): string[];
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
            printChartId?: string;
        };
    } & Record<string, string | boolean>;
    data?: {
        'column-format'?: Record<string, Record<string, unknown>>;
        'column-order'?: number[];
        'vertical-header'?: boolean;
        'horizontal-header'?: boolean;
        transpose?: boolean;
        'upload-method'?: 'external-data' | 'google-spreadsheet' | 'copy';
        'google-spreadsheet-src'?: string;
        'external-data'?: string;
        'external-metadata'?: string;
        changes?: {
            id: string;
            row: number;
            column: number;
            value: string | number;
            time?: number; // Date.now()
            previous?: string | number;
        }[];
        json?: boolean;
    };
    print?: boolean;
    publish?: {
        'embed-height'?: number;
        'embed-width'?: number;
        /** enable/disable the automatic dark mode switching based on browser preferences */
        autoDarkMode?: boolean;
        blocks?: {
            'download-image'?: boolean;
            'download-pdf'?: boolean;
            'download-svg'?: boolean;
            embed?: boolean;
            logo?: {
                /** show the logo in footer (if available) */
                enabled: boolean;
                /** id of logo to show, if multiple logos are available */
                id: string;
            };
            'get-the-data'?: boolean;
        };
        'force-attribution'?: boolean;
        'chart-height'?: number;
    } & {
        [key in `export-${'svg' | 'pdf'}`]?: Record<string, any>;
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
    numRows: () => number;
    numColumns: () => number;
    indexOf: (column: string | null) => number;
    clone: () => Dataset;
    eachColumn: (arg0: (column: Column, index: number, array: Column[]) => any) => void;
    // in the case of JSON data:
    [key: string]: unknown;
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
    save(): void;
    saveSoon(): void;
    onNextSave(callback: () => void): void;
    serialize(): PreparedChart;
    isPassive(): boolean;
    setDataset(dataset: Dataset): void;
    translations(messages: Record<string, string>): void;
    load: (data: ChartData) => void;
    flags: () => RenderFlags;
    attributes: (chart?: PreparedChart) => PreparedChart;
    onChange: (callback: (chart: PreparedChart) => void) => void;
    locales: {
        dayjs: globalThis.ILocale;
        numeral: globalThis.ILocale;
    };
    emotion: typeof import('@emotion/css');
    createPostEvent(): PostEvent;
    translate(key: string, useEditorLocale?: boolean, ...args: string[]): string;
    locale(): string;
    inEditor(): boolean;
    getElementBounds: (element: Element) => Omit<DOMRectReadOnly, 'x' | 'y' | 'toJSON'>;
    getMaxChartHeight: () => number;
    getRelativeMousePosition: (event: MouseEvent, element: HTMLOrSVGElement) => [number, number];
};

export type VisualizationType =
    | 'column-chart'
    | 'd3-area'
    | 'd3-arrow-plot'
    | 'd3-bars-bullet'
    | 'd3-bars-grouped'
    | 'd3-bars-split'
    | 'd3-bars-stacked'
    | 'd3-bars'
    | 'd3-donuts'
    | 'd3-dot-plot'
    | 'd3-lines'
    | 'd3-maps-choropleth'
    | 'd3-maps-symbols'
    | 'd3-multiple-donuts'
    | 'd3-multiple-pies'
    | 'd3-pies'
    | 'd3-range-plot'
    | 'd3-scatter-plot'
    | 'election-donut-chart'
    | 'grouped-column-chart'
    | 'locator-map'
    | 'multiple-lines'
    | 'multiple-columns'
    | 'stacked-column-chart'
    | 'tables';

export type Chart = {
    id: string;
    publicId: string;
    language: string;
    theme: string;
    type: VisualizationType;
    title: string;
    lastEditStep: number;
    publicUrl?: string;
    publicVersion?: number;
    metadata: Metadata;
    thumbnails?: {
        plain: string;
        full: string;
    };
    thumbnailHash: string;
    folderId?: number | null;
    organizationId: string | null;
    authorId: number | null;
};

export type PreparedChart = {
    id?: string;
    type?: VisualizationType;
    title?: string;
    theme?: string;

    guestSession?: undefined;

    lastEditStep?: number;

    publishedAt?: Date;
    publicUrl?: string;
    publicVersion?: number;

    deleted?: boolean;
    deletedAt?: Date;

    forkable?: boolean;
    isFork?: boolean;
    forkedFrom?: string | null;

    metadata?: Metadata;
    /**
     * hash representing the current state of all metadata fields that affect the published chart
     * used in `Publish.svelte` to detect if the chart needs republishing
     */
    chartHash?: string | null;
    language?: string;
    externalData?: string;

    customFields?: Record<string, number | boolean | string>;
    keywords?: string;
    utf8?: boolean;

    createdAt?: Date | string;
    lastModifiedAt?: Date | string;

    workspace?: string | undefined;
    publicId?: string | undefined;
    folderId?: number | null;
    authorId?: number | undefined;
    author?:
        | {
              name?: string | null;
              email?: string | null;
              avatar?: string | null;
              color?: string | null;
          }
        | undefined;
    organizationId?: string | null;
};

/**
 * Paths to known values that should be Date objects
 */
export const PREPARED_CHART_DATE_PATHS = ['publishedAt', 'lastModifiedAt', 'deletedAt'] as const;

type FullVectorOpts = {
    noPitch: boolean;
    noBuilding3d: boolean;
};

export type Visualization = {
    dataset: Dataset;
    get: SettingsGetter<object>;
    theme: () => ThemeData;
    chart: () => DwChart;
    darkMode: (darkMode?: boolean) => boolean;
    axes: AxesGetter;
    libraries: () => ChartLibraries;
    addFilterUI: (args: {
        column: Column;
        type: 'auto' | 'select' | 'buttons' | 'timescale';
    }) => void;
    renderingComplete: () => void;
    size: () => [number, number];
    colorMap: () => (color: string) => string;
    colorMode: (mode?: string) => string;
    chartStore: (chartStore?: Writable<PreparedChart>) => Writable<PreparedChart>;
    /**
     * Use this to wait until a visualization has finished rendering
     *
     * @returns {Promise} resolves when the rendering is completed
     */
    rendered: () => Promise<void>;
    setLocatorMapView: (height: boolean) => void;
    __rendered: boolean;
    __lastRow: number;
    _firstRenderComplete: boolean;
    _SVGExport: FullVectorOpts;
    textDirection: TextDirection;
    meta: any;
    on(eventType: string, callback: (data: any) => any): void;
    fire(eventType: string, data?: any): void;
    off(eventType: string, callback: (data: any) => any): void;
};

/**
 * Chart data can be a string (e.g. CSV data) or JSON (e.g. for locator maps)
 */
export type ChartData = string | Record<string, unknown>;

type AnnotationId = string;
type AnnotationPlot = string;
type AnnotationShowInAllPlots = boolean;

export type TextAnnotationAnchor = 'tc' | 'tr' | 'mr' | 'br' | 'bc' | 'bl' | 'ml' | 'tl' | 'mc';
export type TextAnnotationConnectorLineType = 'straight' | 'curveRight' | 'curveLeft';
export type TextAnnotationArrowHead = 'lines' | 'triangle' | false;
export type TextAnnotationCircleStyle = 'solid' | 'dashed';
export type TextAnnotationConnectorLine = {
    enabled: boolean;
    type: TextAnnotationConnectorLineType;
    circle: boolean;
    stroke: number;
    arrowHead: TextAnnotationArrowHead;
    circleStyle: TextAnnotationCircleStyle;
    circleRadius: number;
    inheritColor: boolean;
    targetPadding: number;
};

export type TextAnnotationProps = {
    plot?: AnnotationPlot;
    showInAllPlots?: AnnotationShowInAllPlots;
    x: number | string;
    y: number | string;
    dx: number;
    dy: number;
    bg: boolean;
    width: number;
    text: string;
    align: TextAnnotationAnchor;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    color: string | false;
    size: number;
    showMobile: boolean;
    showDesktop: boolean;
    connectorLine: TextAnnotationConnectorLine;
    mobileFallback: boolean;
};

export type TextAnnotation = TextAnnotationProps & { id: AnnotationId };

export type RangeAnnotationStrokeType = 'solid' | 'dotted' | 'dashed';
export type RangeAnnotationDisplay = 'range' | 'line';
export type RangeAnnotationType = 'x' | 'y';
export type RangeAnnotationStrokeWidth = 1 | 2 | 3;

export type RangeAnnotation = {
    id: AnnotationId;
    plot?: AnnotationPlot;
    showInAllPlots?: AnnotationShowInAllPlots;
    display: RangeAnnotationDisplay;
    type: RangeAnnotationType;
    x0: number | string;
    x1: number | string;
    y0: number | string;
    y1: number | string;
    color: string;
    opacity: number;
    strokeWidth: RangeAnnotationStrokeWidth;
    strokeType: RangeAnnotationStrokeType;
};

/**
 * @param x - A `null` value reflects an indeterminate state
 * @param y - A `null` value reflects an indeterminate state
 * @param plot - If multiple plots, name of relevant plot
 * @param noPlotOffset - If true, returns x/y values independent of plot position
 */
export type DataToPx = (
    x: number | string | null,
    y: number | string | null,
    plot?: string,
    noPlotOffset?: boolean
) => [number, number];
/**
 * @param plotName - if specified, forces using coordinate system
 * of provided plot instead of looking for closest matching plot.
 * @param clamped - if true, returned values are clamped to plot bounds
 */
export type PxToData = (
    x: number | string,
    y: number | string,
    plot?: string,
    clamped?: boolean
) => {
    x: number | string;
    y: number | string;
    plot?: string | null;
    validPosition?: boolean;
};

export type SelectedAnnotationProps = {
    id: null | string;
    plot: null | string;
    // Text annotations.
    x: null | number;
    y: null | number;
    dx: null | number;
    dy: null | number;
    invalidX: boolean;
    invalidY: boolean;
    width: null | number;
    height: null | number;
    mobileFallback: boolean;
    text: null | string;
    // Range annotations.
    start: null | number;
    end: null | number;
    invalidStart: boolean;
    invalidEnd: boolean;
    bounds:
        | Record<string, never>
        | {
              x: number;
              y: number;
              width: number;
              height: number;
          };
};

export type EditorState = {
    defaults: { text?: TextAnnotation; range?: RangeAnnotation; line?: RangeAnnotation };
    selectedTextAnnotations: string[];
    selectedRangeAnnotations: string[];
    createMode: false | 'text' | 'range';
    disableControls: boolean;
    hideConnectorLine: boolean;
    forceOffsetDrag: boolean;
    width: null | number;
    height: null | number;
    dataToPx: null | DataToPx;
    pxToData: null | PxToData;
    plotHasUpdated: boolean;
    draggingOutOfBounds: boolean;
    activeRepeatedAnnotationIndex: null | number;
    messages: {
        disableControls: string;
    };
    selectedAnnotationProps: SelectedAnnotationProps;
};
