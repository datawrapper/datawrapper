import test, { ExecutionContext } from 'ava';
import { JsonCRDT } from './JsonCRDT.js';
import { sample } from 'lodash';
import { forEachOther, saveSnapshot } from '../../test/helpers/crdt.js';
import { Update } from './CRDT.js';

/**
 * Run a mini fuzz test for the JsonCRDT. This test is fast enough to be run in CI.
 *
 * @param t Test context
 * @param options
 * @param options.instances Number of CRDT instances to create
 * @param options.runs Number of runs to perform. Each run uses a different random initial state.
 * @param options.iterations Number of iterations/updates to perform for each run.
 */
function runMiniFuzz(
    t: ExecutionContext,
    options: { instances?: number; runs?: number; iterations?: number }
) {
    const { instances = 2, runs = 1000, iterations = 20 } = options;

    // Helper functions to generate random data.
    const generateRandomKey = (level: number) => `${sample([...'abcdef'])}${level}`;

    const generateRandomValue = () =>
        sample([{}, null, 1, 2, 'test', 'abc', new Date(), [], [1, 2, 3]]);

    function generateRandomObject(lvl = 0) {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const obj = {} as any;

        for (let i = 0; i < 1; i++) {
            obj[generateRandomKey(lvl)] = generateRandomValue();
        }

        if (lvl < 3) {
            for (let i = 0; i < 1; i++) {
                obj[generateRandomKey(lvl)] = generateRandomObject(lvl + 1);
            }
        }

        return obj;
    }

    let counter = 0;
    while (counter < runs) {
        const initialData = generateRandomObject();

        const crdts = Array.from(
            { length: instances },
            (_, i) => new JsonCRDT({ nodeId: i + 1, data: initialData })
        );
        crdts.forEach(crdt => crdt.setDebug(true));

        const updates = Array.from({ length: instances }, () => [] as Update<object>[]);

        // Generate updates for each CRDT.
        for (let i = 0; i < iterations; i++) {
            for (let j = 0; j < instances; j++) {
                const newValue = generateRandomObject();
                const diff = crdts[j].calculateDiff(newValue);
                const update = crdts[j].createUpdate(diff);
                if (update) updates[j].push(update);
            }
        }

        // Apply foreign updates to each CRDT.
        forEachOther(crdts, ([a], [b]) => {
            crdts[a].applyUpdates(updates[b]);
        });

        forEachOther(crdts, ([a, crdtA], [b, crdtB]) => {
            /* eslint-disable no-console */
            if (!t.deepEqual(crdtA.data(), crdtB.data())) {
                // Log the history of each CRDT.
                // crdts.forEach((crdt, idx) => crdt.getDebugInfo().printHistory(`CRDT ${idx}`));

                crdtA.getDebugInfo().printHistory(`CRDT ${a}`);
                crdtB.getDebugInfo().printHistory(`CRDT ${b}`);

                console.log(`Failed after ${counter} runs`);

                const id = saveSnapshot(crdts.map(c => c.getDebugInfo().getSnapshot()));
                console.log('Snapshot ID:', id);

                throw new Error(`CRDTs ${a} and ${b} have diverged. Printing histories.`);
            }
            /* eslint-enable no-console */
        });
        counter++;
    }
}

test(`mini fuzz: combine two objects`, t => {
    t.timeout(60 * 1000);

    runMiniFuzz(t, { instances: 2 });
});

test(`mini fuzz: combine three objects`, t => {
    t.timeout(60 * 1000);

    runMiniFuzz(t, { instances: 3 });
});
