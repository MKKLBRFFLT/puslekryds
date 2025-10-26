import type { Coord } from './puzzle';

export type WordTile = {
  id: string; // matches PuzzleWord.id
  currentDir: 'across' | 'down'; // player-rotatable in the pool
  placed?: boolean; // becomes true after correct drop
};

export type RevealState = {
  revealedCellKeys: Set<string>; // "r,c"
};

export type DragState = {
  draggingWordId?: string | null;
};
