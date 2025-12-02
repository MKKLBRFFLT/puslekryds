// src/lib/ipuz.ts
import type { Orientation, Word as TileWord } from '../components/WordPool/WordPool';

export type Coord = { r: number; c: number };

export type PuzzleWord = {
  id: string; // e.g., "1-A" or "14-D"
  dir: Orientation; // 'horizontal' | 'vertical' (CORRECT direction)
  cells: Coord[]; // ordered from start to end; length >= 2
  text: string; // the answer text (used to build WordPool tiles)
};

export type Puzzle = {
  rows: number;
  cols: number;
  words: PuzzleWord[];
  /** key "r-c" -> letter (solution) */
  solutionLetters: Record<string, string>;
  /** set of "r-c" for all start cells (useful for UX) */
  startCellKeys: Set<string>;
  blockedKeys: Set<string>;
};

const cellKey = (r: number, c: number) => `${r}-${c}`;
const startKey = (r: number, c: number, dir: Orientation) => `${r}-${c}|${dir}`;

type Ipuz = {
  dimensions: { width: number; height: number };
  puzzle: (number | string)[][];
  solution: (string | { value: string; cell: number | ':' })[][];
  empty: string; // typically ":"
};

export function ipuzToPuzzle(ipuz: Ipuz): Puzzle {
  const { width, height } = ipuz.dimensions;
  const W = width;
  const H = height;
  const EMPTY = ipuz.empty; // usually ":"

  // 1) Build a grid of blocks and start numbers from ipuz.puzzle
  // puzzle[r][c]: number -> clue number at start cell
  //                "#"    -> block
  //                ":"    -> light/empty cell (no number)
  const isBlock = (r: number, c: number) => ipuz.puzzle[r][c] === '#';
  const startNumber = (r: number, c: number): number | null => {
    const v = ipuz.puzzle[r][c];
    return typeof v === 'number' ? v : null;
  };

  // 2) Gather letters from ipuz.solution into a quick map
  const solutionLetters: Record<string, string> = {};
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const cell = ipuz.solution[r][c];
      if (cell === '#') continue;
      if (typeof cell === 'object' && typeof cell.value === 'string') {
        solutionLetters[cellKey(r, c)] = cell.value;
      }
    }
  }

  // 3) Scan for Across and Down words using starts
  const words: PuzzleWord[] = [];
  const startCellKeys = new Set<string>();

  const inBounds = (r: number, c: number) => r >= 0 && r < H && c >= 0 && c < W;

  // Across: start if not block AND (c==0 OR left is block)
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (isBlock(r, c)) continue;
      const isStart = c === 0 || isBlock(r, c - 1);
      if (!isStart) continue;

      // build the run to the right
      const cells: Coord[] = [];
      let cc = c;
      while (inBounds(r, cc) && !isBlock(r, cc)) {
        cells.push({ r, c: cc });
        cc++;
      }
      if (cells.length < 2) continue; // ignore 1-letter entries

      const num = startNumber(r, c);
      const id = num ? `${num}-A` : `${r},${c}-A`;
      const text = cells.map(({ r, c }) => solutionLetters[cellKey(r, c)] ?? '').join('');
      words.push({ id, dir: 'horizontal', cells, text });
      startCellKeys.add(cellKey(r, c));
    }
  }

  // Down: start if not block AND (r==0 OR above is block)
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (isBlock(r, c)) continue;
      const isStart = r === 0 || isBlock(r - 1, c);
      if (!isStart) continue;

      // build the run downward
      const cells: Coord[] = [];
      let rr = r;
      while (inBounds(rr, c) && !isBlock(rr, c)) {
        cells.push({ r: rr, c });
        rr++;
      }
      if (cells.length < 2) continue; // ignore 1-letter entries

      const num = startNumber(r, c);
      const id = num ? `${num}-D` : `${r},${c}-D`;
      const text = cells.map(({ r, c }) => solutionLetters[cellKey(r, c)] ?? '').join('');
      words.push({ id, dir: 'vertical', cells, text });
      startCellKeys.add(cellKey(r, c));
    }
  }

  const blockedKeys = new Set<string>();
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (isBlock(r, c)) blockedKeys.add(`${r}-${c}`);
    }
  }

  // Optional consistency check: letters exist for all cells in words
  // (ipuz.solution sometimes omits letters; your data seems filled)
  // You can add warnings here if needed.

  return {
    rows: H,
    cols: W,
    words,
    solutionLetters,
    startCellKeys,
    blockedKeys,
  };
}

/** Build WordPool tiles from the puzzle words (UI state). */
export function buildTilesFromPuzzle(puzzle: Puzzle): TileWord[] {
  return puzzle.words.map((w) => ({
    id: w.id,
    text: w.text,
    orientation: 'horizontal', // initial current orientation equals the correct dir; user can rotate
  }));
}

/** Build a start-index for O(1) validation: "r-c|dir" -> wordId */
export function buildStartIndex(puzzle: Puzzle): Map<string, string> {
  const idx = new Map<string, string>();
  for (const w of puzzle.words) {
    const start = w.cells[0];
    idx.set(startKey(start.r, start.c, w.dir), w.id);
  }
  return idx;
}

/** Convenience to rebuild wordId -> cells map */
export function buildWordCellsIndex(puzzle: Puzzle): Map<string, Coord[]> {
  const m = new Map<string, Coord[]>();
  for (const w of puzzle.words) m.set(w.id, w.cells);
  return m;
}
