import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import './WordPool.css';

export type Orientation = 'horizontal' | 'vertical';

export type Word = {
  id: string;
  text: string;
  orientation: Orientation;
};

type WordPoolProps = {
  words: Word[];
  onToggleOrientation: (id: string) => void;
};

function WordTile({ word, onToggle }: { word: Word; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: word.id,
    data: { orientation: word.orientation, text: word.text },
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.7 : 1,
    cursor: 'grab',
  };

  const content =
    word.orientation === 'horizontal' ? (
      <span className="word-tile__text-inline">{word.text}</span>
    ) : (
      <span className="word-tile__text-stacked">
        {word.text.split('').map((ch, i) => (
          <span key={i}>{ch}</span>
        ))}
      </span>
    );

  return (
    <div className="word-row">
      {/* Draggable tile */}
      <div
        ref={setNodeRef}
        className={`word-tile${isDragging ? ' is-dragging' : ''} word-tile--${word.orientation}`}
        style={style}
        {...attributes}
        {...listeners}
        role="button"
      >
        <div className={`word-tile__badge word-tile__badge--${word.orientation}`}>
          {word.orientation === 'horizontal' ? 'H' : 'V'}
        </div>
        <div className="word-tile__content">{content}</div>
      </div>

      {/* Rotation button, outside the tile */}
      <button
        className="word-tile__toggle-outside"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggle();
        }}
        aria-label={`Turn ${word.text} ${
          word.orientation === 'horizontal' ? 'vertical' : 'horizontal'
        }`}
        title="Toggle orientation"
      >
        {word.orientation === 'horizontal' ? '↕' : '↔'}
      </button>
    </div>
  );
}

export default function WordPool({ words, onToggleOrientation }: WordPoolProps) {
  return (
    <aside className="word-pool">
      <h2 className="word-pool__title">Word Pool</h2>
      <div className="word-pool__list">
        {words.map((w) => (
          <WordTile key={w.id} word={w} onToggle={() => onToggleOrientation(w.id)} />
        ))}
      </div>
    </aside>
  );
}
