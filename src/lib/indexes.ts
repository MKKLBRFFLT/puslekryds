import type { Puzzle, PuzzleWord } from '../types/puzzle';
import { cellKey, startKey } from '../types/keys';

export type PuzzleIndexes = {
  startKeyToWordId: Map<string, string>; // "r,c|dir" -> wordId
  wordIdToCells: Map<string, { r: number; c: number }[]>;
  startCellKeys: Set<string>; // "r,c" for visual hints
};

export function buildIndexes(puzzle: Puzzle): PuzzleIndexes {
  const startKeyToWordId = new Map<string, string>();
  const wordIdToCells = new Map<string, PuzzleWord['cells']>();
  const startCellKeys = new Set<string>();

  for (const w of puzzle.words) {
    if (w.cells.length < 2) {
      throw new Error(`Word ${w.id} has length < 2 (1-letter words are not allowed).`);
    }
    wordIdToCells.set(w.id, w.cells);
    const start = w.cells[0];
    const sk = startKey(start, w.dir);
    if (startKeyToWordId.has(sk)) {
      throw new Error(`Duplicate start for ${sk} (dir=${w.dir}).`);
    }
    startKeyToWordId.set(sk, w.id);
    startCellKeys.add(cellKey(start));
  }

  // Optional consistency check: letters across crossings already validated elsewhere

  return { startKeyToWordId, wordIdToCells, startCellKeys };
}
