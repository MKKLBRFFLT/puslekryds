import type { Coord } from './puzzle';

export const cellKey = (pos: Coord) => `${pos.r},${pos.c}`;
export const startKey = (pos: Coord, dir: 'across' | 'down') => `${pos.r},${pos.c}|${dir}`;
