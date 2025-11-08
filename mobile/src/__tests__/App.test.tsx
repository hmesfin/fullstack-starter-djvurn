import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText(/React Native \+ Dark Mode/i)).toBeTruthy()
  })

  it('displays the session title', () => {
    render(<App />)
    expect(screen.getByText(/Session 5 - UI Foundation & Polish/i)).toBeTruthy()
  })

  it('displays the theme toggle button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Toggle/i })).toBeTruthy()
  })
})
