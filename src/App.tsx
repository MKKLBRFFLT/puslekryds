import './App.css';
import { useMemo, useState, useCallback, useEffect } from 'react';
import Grid from './components/Grid/Grid';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import WordPool from './components/WordPool/WordPool';
import type { Word, Orientation } from './components/WordPool/WordPool';

import ipuzData from './assets/samplepuzzle.json';
import {
  ipuzToPuzzle,
  buildTilesFromPuzzle,
  buildStartIndex,
  buildWordCellsIndex,
} from './lib/ipuz';
import type { Coord } from './lib/ipuz';

/** Local helpers */
const cellKey = (p: Coord) => `${p.r}-${p.c}`;
const startKey = (p: Coord, dir: Orientation) => `${p.r}-${p.c}|${dir}`;

export default function App() {
  /** Immutable puzzle derived from IPUZ */
  const puzzle = useMemo(() => ipuzToPuzzle(ipuzData as any), []);

  /** Word tiles (UI state with mutable orientation) */
  const [words, setWords] = useState<Word[]>(() => buildTilesFromPuzzle(puzzle));

  /** Already placed words */
  const [placedWordIds, setPlacedWordIds] = useState<Set<string>>(new Set());

  /** Revealed cell keys "r-c" */
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const [recentAutoSolved, setRecentAutoSolved] = useState<string[]>([]);

  /** Show only unplaced words in the pool */
  const remainingWords = useMemo(
    () => words.filter((w) => !placedWordIds.has(w.id)),
    [words, placedWordIds],
  );

  /** Fast indexes for validation & reveal */
  const startIndex = useMemo(() => buildStartIndex(puzzle), [puzzle]);
  const wordCells = useMemo(() => buildWordCellsIndex(puzzle), [puzzle]);

  /** DnD sensor (mobile-friendly: require small move before drag) */
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  const handleDragStart = (_e: DragStartEvent) => {
    // no-op for now
  };

  /** Rotate tile (UI only) */
  const toggleOrientation = useCallback((id: string) => {
    setWords((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              orientation: w.orientation === 'horizontal' ? 'vertical' : 'horizontal',
            }
          : w,
      ),
    );
  }, []);

  /** Validate drop against authored start+dir; reveal on success */
  const handleDragEnd = (e: DragEndEvent) => {
    const wordId = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId || !overId.startsWith('cell-')) return;

    const [, rStr, cStr] = overId.split('-');
    const r = Number(rStr);
    const c = Number(cStr);

    if (placedWordIds.has(wordId)) return;

    // Tile's CURRENT orientation at drop time
    const currentOrientation: Orientation | undefined =
      (e.active.data?.current as any)?.orientation ??
      words.find((w) => w.id === wordId)?.orientation;

    if (!currentOrientation) return;

    // Check authored start for (r,c|dir)
    const expectedId = startIndex.get(startKey({ r, c }, currentOrientation));
    if (expectedId !== wordId) {
      // wrong start or wrong direction -> reject silently (or toast/shake)
      return;
    }

    // Success: reveal all cells for this word
    const cells = wordCells.get(wordId) ?? [];
    setRevealed((prev) => {
      const next = new Set(prev);
      for (const pos of cells) next.add(cellKey(pos));
      return next;
    });
    setPlacedWordIds((prev) => {
      const next = new Set(prev);
      next.add(wordId);
      return next;
    });
  };

  useEffect(() => {
    setPlacedWordIds((prev) => {
      const next = new Set(prev);
      const newlySolved: string[] = [];

      for (const [wordId, cells] of wordCells) {
        if (next.has(wordId)) continue;

        let allRevealed = true;
        for (const pos of cells) {
          if (!revealed.has(cellKey(pos))) {
            allRevealed = false;
            break;
          }
        }

        if (allRevealed) {
          next.add(wordId);
          newlySolved.push(wordId);
        }
      }

      if (newlySolved.length > 0) {
        setRecentAutoSolved((prevQueue) => [...prevQueue, ...newlySolved]);
        return next;
      }

      return prev;
    });
  }, [revealed, wordCells]);

  /** Grid wants a key->letter map for revealed cells */
  const letters = useMemo(() => {
    const out: Record<string, string> = {};
    for (const key of revealed) {
      const ch = (puzzle.solutionLetters as any)[key];
      if (ch) out[key] = ch;
    }
    return out;
  }, [revealed, puzzle.solutionLetters]);

  /** Occupied = revealed (for tinting) */
  const occupiedKeys = useMemo(() => new Set(Array.from(revealed)), [revealed]);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="app-layout">
        <Grid
          rows={puzzle.rows}
          cols={puzzle.cols}
          occupiedKeys={occupiedKeys}
          letters={letters}
          blockedKeys={puzzle.blockedKeys}
        />
        <WordPool words={remainingWords} onToggleOrientation={toggleOrientation} />
      </div>
    </DndContext>
  );
}
