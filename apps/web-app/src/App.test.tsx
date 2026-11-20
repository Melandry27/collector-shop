import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { defaultConfig } from './config';

describe('App', () => {
  it('affiche le nom de la plateforme et la section catalogue', () => {
    render(<App config={defaultConfig} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Collector.shop' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Catalogue' })).toBeInTheDocument();
  });
});
