import './App.css';
import { useMemo, useState, useCallback } from 'react';
import Grid from './components/Grid/Grid';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import WordPool from './components/WordPool/WordPool';
import type { Word, Orientation } from './components/WordPool/WordPool';

/** Fixed correct start cells for each word (0-based r,c). */

const CORRECT_TARGET: Record<string, { r: number; c: number; orientation: Orientation }> = {
  w1: { r: 1, c: 1, orientation: 'horizontal' }, // APPLE
  w2: { r: 1, c: 1, orientation: 'vertical' }, // PEAR
  w3: { r: 2, c: 4, orientation: 'horizontal' }, // BERRY
  w4: { r: 5, c: 2, orientation: 'vertical' }, // CAR
  w5: { r: 7, c: 0, orientation: 'horizontal' }, // MUFFIN
  w6: { r: 0, c: 6, orientation: 'horizontal' }, // CONTINENT
};

/** Initial words with an initial (mutable) orientation. */
const initialWords: Word[] = [
  { id: 'w1', text: 'APPLE', orientation: 'horizontal' },
  { id: 'w2', text: 'PEAR', orientation: 'horizontal' },
  { id: 'w3', text: 'BERRY', orientation: 'horizontal' },
  { id: 'w4', text: 'CAR', orientation: 'horizontal' },
  { id: 'w5', text: 'MUFFIN', orientation: 'horizontal' },
  { id: 'w6', text: 'CONTINENT', orientation: 'horizontal' },
];

export default function App() {
  const [words, setWords] = useState<Word[]>(initialWords);

  // letters stamped into the grid: key "r-c" -> single character
  const [letters, setLetters] = useState<Record<string, string>>({});

  // which words have been successfully placed
  const [placedWordIds, setPlacedWordIds] = useState<Set<string>>(new Set());

  const remainingWords = useMemo(
    () => words.filter((w) => !placedWordIds.has(w.id)),
    [words, placedWordIds],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
  );

  const handleDragStart = (_e: DragStartEvent) => {
    console.log('Starting Drag.');
  };

  const toggleOrientation = useCallback((id: string) => {
    setWords((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, orientation: w.orientation === 'horizontal' ? 'vertical' : 'horizontal' }
          : w,
      ),
    );
  }, []);

  const handleDragEnd = (e: DragEndEvent) => {
    const wordId = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId || !overId.startsWith('cell-')) return;

    const [, rStr, cStr] = overId.split('-');
    const r = Number(rStr);
    const c = Number(cStr);

    if (placedWordIds.has(wordId)) {
      console.log(`Word ${wordId} is already placed; ignoring drop.`);
      return;
    }

    const target = CORRECT_TARGET[wordId];
    if (!target) {
      console.log(`No predetermined target for word ${wordId}.`);
      return;
    }

    // 1) Check start cell
    if (target.r !== r || target.c !== c) {
      console.log(
        `Incorrect start cell for ${wordId}. Expected cell-${target.r}-${target.c}, got cell-${r}-${c}.`,
      );
      return;
    }

    // 2) Check orientation
    const word = words.find((w) => w.id === wordId);
    if (!word) return;

    if (word.orientation !== target.orientation) {
      console.log(
        `Incorrect orientation for ${wordId}. Expected ${target.orientation}, got ${word.orientation}.`,
      );
      return;
    }

    // OK: stamp letters along the (correct) current orientation
    setLetters((prev) => {
      const next = { ...prev };
      const text = word.text;
      if (word.orientation === 'horizontal') {
        for (let i = 0; i < text.length; i++) next[`${r}-${c + i}`] = text[i];
      } else {
        for (let i = 0; i < text.length; i++) next[`${r + i}-${c}`] = text[i];
      }
      return next;
    });

    setPlacedWordIds((prev) => new Set(prev).add(wordId));
  };

  // Build a Set of occupied cell keys for tinting (optional)
  const occupiedKeys = useMemo(() => new Set(Object.keys(letters)), [letters]);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="app-layout">
        <Grid rows={10} cols={10} occupiedKeys={occupiedKeys} letters={letters} />
        {/* Pass only unplaced words to the pool */}
        <WordPool words={remainingWords} onToggleOrientation={toggleOrientation} />
      </div>
    </DndContext>
  );
}
