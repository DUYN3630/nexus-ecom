// src/components/common/LoadingSpinner.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render the spinner with an accessible name', () => {
    render(<LoadingSpinner />);
    
    // Find the element by its accessibility role ('status') and its accessible name ('Loading...')
    // This is a robust way to test both rendering and accessibility.
    const spinner = screen.getByRole('status', { name: /loading/i });
    
    expect(spinner).toBeInTheDocument();
  });
});
