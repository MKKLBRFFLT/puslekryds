import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Grid from '../components/Grid/Grid';

describe('Grid component', () => {
  it('renders correct number of cells', () => {
    render(<Grid rows={3} cols={3} />);
    const cells = screen.getAllByRole('gridcell', { hidden: true });
    expect(cells.length).toBe(9);
  });
});
