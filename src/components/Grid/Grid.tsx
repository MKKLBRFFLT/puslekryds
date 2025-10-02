import React from 'react';
import './Grid.css';
import { useDroppable } from '@dnd-kit/core';

type GridProps = {
  rows: number;
  cols: number;
  occupiedKeys?: Set<string>;
  /** key "r-c" -> single character placed into that cell */
  letters?: Record<string, string>;
};

function DroppableCell({
  r,
  c,
  occupied,
  letter,
}: {
  r: number;
  c: number;
  occupied: boolean;
  letter?: string;
}) {
  const id = `cell-${r}-${c}`;
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={[
        'grid-cell',
        isOver ? 'grid-cell--over' : '',
        occupied ? 'grid-cell--occupied' : '',
        letter ? 'grid-cell--has-letter' : '',
      ].join(' ')}
      data-row={r}
      data-col={c}
      data-id={id}
    >
      {letter && <span className="grid-cell__letter">{letter}</span>}
    </div>
  );
}

export default function Grid(props: GridProps) {
  const cells = [];
  for (let r = 0; r < props.rows; r++) {
    for (let c = 0; c < props.cols; c++) {
      const key = `${r}-${c}`;
      cells.push(
        <DroppableCell
          key={key}
          r={r}
          c={c}
          occupied={props.occupiedKeys?.has(key) ?? false}
          letter={props.letters?.[key]}
        />,
      );
    }
  }

  return (
    <div
      className="grid-container"
      style={{
        gridTemplateRows: `repeat(${props.rows}, var(--cell-size))`,
        gridTemplateColumns: `repeat(${props.cols}, var(--cell-size))`,
      }}
    >
      {cells}
    </div>
  );
}
