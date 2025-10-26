export type Coord = { r: number; c: number };

export type PuzzleCell = {
  pos: Coord; // grid position
  letter: string; // A–Z
  blocked?: boolean; // optional black squares
  revealed?: boolean; // runtime flag; default false
};

export type PuzzleWord = {
  id: string;
  dir: 'across' | 'down'; // CORRECT direction (immutable)
  cells: Coord[]; // ordered, contiguous; cells[0] is start; length >= 2
  clueNumber?: number;
  clue?: string;
};

export type Puzzle = {
  rows: number;
  cols: number;
  cells: PuzzleCell[]; // letters for every non-blocked cell
  words: PuzzleWord[];
};
