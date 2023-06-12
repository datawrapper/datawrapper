import test from 'ava';
import { Visualization } from './chartTypes';
import getOverlayColumnTitle from './getOverlayColumnTitle';

// This tests mocks some properties of Visualization but not all of them, therefor
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

const visOne = (<DeepPartial<Visualization>>{
    dataset: {
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
    }
}) as Visualization;

const visTwo = (<DeepPartial<Visualization>>{
    dataset: {
        hasColumn() {
            return false;
        },
        column() {
            throw new Error('should not be called');
        }
    }
}) as Visualization;

const colName = 'a-super-col-name';
const ZERO_BASELINE = '--zero-baseline--';

test('has a column name', t => {
    t.deepEqual(getOverlayColumnTitle(visOne, colName, ZERO_BASELINE), colName);
});

test('has no column name', t => {
    t.deepEqual(getOverlayColumnTitle(visTwo, colName, ZERO_BASELINE), '');
});

test('column name is ZERO_BASELINE', t => {
    t.deepEqual(getOverlayColumnTitle(visOne, ZERO_BASELINE, ZERO_BASELINE), '0');
});
