import type { Puzzle } from '../types/puzzle';
import { cellKey } from '../types/keys';

/** Mark all cells of a word revealed=true and return the keys revealed. */
export function revealWord(
  puzzle: Puzzle,
  wordId: string,
  wordIdToCells: Map<string, { r: number; c: number }[]>,
): string[] {
  const cells = wordIdToCells.get(wordId);
  if (!cells) return [];
  const revealed: string[] = [];
  for (const pos of cells) {
    const key = cellKey(pos);
    // find the puzzle cell (linear search is fine for small boards; index later if needed)
    const pc = puzzle.cells.find((c) => c.pos.r === pos.r && c.pos.c === pos.c);
    if (pc && !pc.revealed) {
      pc.revealed = true;
      revealed.push(key);
    } else if (pc && pc.revealed) {
      revealed.push(key); // already revealed (overlap)
    }
  }
  return revealed;
}
