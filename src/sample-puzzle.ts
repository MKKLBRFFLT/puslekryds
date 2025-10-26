import type { Puzzle } from './types/puzzle';

export const samplePuzzle: Puzzle = {
  rows: 10,
  cols: 10,
  cells: [
    // Minimal set for demo; normally you'd include all non-blocked cells
    { pos: { r: 1, c: 1 }, letter: 'A', revealed: false },
    { pos: { r: 1, c: 2 }, letter: 'P', revealed: false },
    { pos: { r: 1, c: 3 }, letter: 'P', revealed: false },
    { pos: { r: 1, c: 4 }, letter: 'L', revealed: false },
    { pos: { r: 1, c: 5 }, letter: 'E', revealed: false },

    { pos: { r: 1, c: 3 }, letter: 'P', revealed: false }, // shared cell in example
    { pos: { r: 2, c: 3 }, letter: 'E', revealed: false },
    { pos: { r: 3, c: 3 }, letter: 'A', revealed: false },
    { pos: { r: 4, c: 3 }, letter: 'R', revealed: false },
  ],
  words: [
    {
      id: 'w1',
      dir: 'across',
      cells: [
        { r: 1, c: 1 },
        { r: 1, c: 2 },
        { r: 1, c: 3 },
        { r: 1, c: 4 },
        { r: 1, c: 5 },
      ],
    }, // APPLE
    {
      id: 'w2',
      dir: 'down',
      cells: [
        { r: 1, c: 3 },
        { r: 2, c: 3 },
        { r: 3, c: 3 },
        { r: 4, c: 3 },
      ],
    }, // P-E-A-R
  ],
};
