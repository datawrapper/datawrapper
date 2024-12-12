import test from 'ava';
import { ZERO_BASELINE, getOverlayColor, getOverlayColumnTitle } from './overlays';
import { Dataset, Overlay } from './chartTypes';

const overlayOne = {
    color: 7,
    opacity: 0.35
} as Overlay;
const overlayTwo = {
    color: '#ff5e4b',
    opacity: 0.35
} as Overlay;
const overlayThree = {
    color: 0,
    opacity: 0.35
} as Overlay;
const theme = {
    colors: {
        palette: [
            '#18a1cd',
            '#1d81a2',
            '#15607a',
            '#00dca6',
            '#09bb9f',
            '#009076',
            '#c4c4c4',
            '#c71e1d',
            '#fa8c00',
            '#ffca76',
            '#ffe59c'
        ]
    }
};

test('check color from with color from palette', t => {
    t.deepEqual(getOverlayColor(overlayOne, theme), 'rgba(199,30,29, 0.35)');
});

test('check color without palette', t => {
    t.deepEqual(getOverlayColor(overlayTwo, theme), 'rgba(255,94,75, 0.35)');
});

test('overlay color is allowed to be same as baseColor', t => {
    t.deepEqual(getOverlayColor(overlayThree, theme), 'rgba(24,161,205, 0.35)');
});

// This tests mocks some properties of Visualization but not all of them, therefore
// we need to declare the type as <Partial<Visualization>>. However, we also only
// partially mock some of the descendents of visualization (vis.dataset) so we need
// to define this DeepPartial type
//
// TODO: Perhaps replace this with type-fest/PartialDeep some day
type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

const datasetOne = (<DeepPartial<Dataset>>{
    hasColumn() {
        return true;
    },
    column(title: string) {
        return {
            title() {
                return title;
            }
        };
    }
}) as Dataset;

const datasetTwo = (<DeepPartial<Dataset>>{
    hasColumn() {
        return false;
    },
    column() {
        throw new Error('should not be called');
    }
}) as Dataset;

const colName = 'a-super-col-name';

test('has a column name', t => {
    t.deepEqual(getOverlayColumnTitle(datasetOne, colName), colName);
});

test('has no column name', t => {
    t.deepEqual(getOverlayColumnTitle(datasetTwo, colName), '');
});

test('column name is ZERO_BASELINE', t => {
    t.deepEqual(getOverlayColumnTitle(datasetOne, ZERO_BASELINE), '0');
});
