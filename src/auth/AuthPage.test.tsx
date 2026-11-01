import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from './AuthProvider';
import { AuthPage } from './AuthPage';

describe('AuthPage', () => {
  it('explains that Supabase configuration is required and keeps auth actions disabled', () => {
    render(<MemoryRouter><AuthProvider><AuthPage /></AuthProvider></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByText('Connect your Supabase project')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeDisabled();
  });
});
