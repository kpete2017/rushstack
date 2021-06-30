"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const Selection_1 = require("../Selection");
const { union, intersection, expandAllDependencies, expandAllConsumers } = Selection_1.Selection;
const projectA = {
    dependencyProjects: new Set(),
    consumingProjects: new Set(),
    toString() {
        return 'A';
    }
};
const projectB = {
    dependencyProjects: new Set(),
    consumingProjects: new Set(),
    toString() {
        return 'B';
    }
};
const projectC = {
    dependencyProjects: new Set(),
    consumingProjects: new Set(),
    toString() {
        return 'C';
    }
};
const projectD = {
    dependencyProjects: new Set([projectA, projectB]),
    consumingProjects: new Set(),
    toString() {
        return 'D';
    }
};
const projectE = {
    dependencyProjects: new Set([projectC, projectD]),
    consumingProjects: new Set(),
    toString() {
        return 'E';
    }
};
const projectF = {
    dependencyProjects: new Set([projectE]),
    consumingProjects: new Set(),
    toString() {
        return 'F';
    }
};
const projectG = {
    dependencyProjects: new Set(),
    consumingProjects: new Set(),
    toString() {
        return 'G';
    }
};
const projectH = {
    dependencyProjects: new Set([projectF, projectG]),
    consumingProjects: new Set(),
    toString() {
        return 'H';
    }
};
const nodes = new Set([
    projectA,
    projectB,
    projectC,
    projectD,
    projectE,
    projectF,
    projectG,
    projectH
]);
// Populate the bidirectional graph
for (const node of nodes) {
    for (const dep of node.dependencyProjects) {
        dep.consumingProjects.add(node);
    }
}
expect.extend({
    toMatchSet(received, expected) {
        for (const element of expected) {
            if (!received.has(element)) {
                return {
                    pass: false,
                    message: () => `Expected [${[...received].join(', ')}] to contain ${element}`
                };
            }
        }
        for (const element of received) {
            if (!expected.has(element)) {
                return {
                    pass: false,
                    message: () => `Expected [${[...received].join(', ')}] to not contain ${element}`
                };
            }
        }
        return {
            pass: true,
            message: () => `Expected [${[...received].join(', ')}] to not match [${[...expected].join(', ')}]`
        };
    }
});
describe('union', () => {
    it('combines sets', () => {
        const result = union([projectA, projectB], [projectC], [projectA], [projectB]);
        expect(result).toMatchSet(new Set([projectA, projectB, projectC]));
    });
});
describe('intersection', () => {
    it('intersects sets', () => {
        const result = intersection([projectC, projectD], new Set([projectD, projectE, projectG, projectA]), new Set([projectD]));
        expect(result).toMatchSet(new Set([projectD]));
    });
    it('will produce the empty set in nothing matches', () => {
        const result = intersection([projectC, projectD], new Set([projectE, projectG, projectA]), new Set([projectD]));
        expect(result).toMatchSet(new Set());
    });
    it('handles identical inputs', () => {
        const result = intersection(nodes, nodes, nodes);
        expect(result).toMatchSet(nodes);
    });
});
describe('expandAllDependencies', () => {
    it('expands at least one level of dependencies', () => {
        const result = expandAllDependencies([projectD]);
        expect(result).toMatchSet(new Set([projectA, projectB, projectD]));
    });
    it('expands all levels of dependencies', () => {
        const result = expandAllDependencies([projectF]);
        expect(result).toMatchSet(new Set([projectA, projectB, projectC, projectD, projectE, projectF]));
    });
    it('handles multiple inputs', () => {
        const result = expandAllDependencies([projectC, projectD]);
        expect(result).toMatchSet(new Set([projectA, projectB, projectC, projectD]));
    });
});
describe('expandAllConsumers', () => {
    it('expands at least one level of dependents', () => {
        const result = expandAllConsumers([projectF]);
        expect(result).toMatchSet(new Set([projectF, projectH]));
    });
    it('expands all levels of dependents', () => {
        const result = expandAllConsumers([projectC]);
        expect(result).toMatchSet(new Set([projectC, projectE, projectF, projectH]));
    });
    it('handles multiple inputs', () => {
        const result = expandAllConsumers([projectC, projectB]);
        expect(result).toMatchSet(new Set([projectB, projectC, projectD, projectE, projectF, projectH]));
    });
});
//# sourceMappingURL=Selection.test.js.map