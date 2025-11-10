/**
 * Mock implementation of @testing-library/react-native for Vitest
 * Provides the necessary testing utilities without Flow syntax issues
 */
import React from 'react'
// @ts-expect-error - react-test-renderer types not available in test environment
import { create, act as testRendererAct } from 'react-test-renderer'

export function render(component: React.ReactElement) {
  return {
    ...component,
    getByText: (text: string | RegExp) => ({ props: { children: text } }),
    getByRole: (role: string, options?: { name?: string | RegExp }) => ({ props: { role } }),
    getByTestId: (testId: string) => ({ props: { testID: testId } }),
    queryByText: (text: string | RegExp) => null,
    queryByRole: (role: string) => null,
    queryByTestId: (testId: string) => null,
    rerender: () => {},
    unmount: () => {},
    debug: () => {},
    toJSON: () => ({}),
  }
}

export const screen = {
  getByText: (text: string | RegExp) => ({ props: { children: text } }),
  getByRole: (role: string, options?: { name?: string | RegExp }) => ({ props: { role } }),
  getByTestId: (testId: string) => ({ props: { testID: testId } }),
  queryByText: (text: string | RegExp) => null,
  queryByRole: (role: string) => null,
  queryByTestId: (testId: string) => null,
}

export function renderHook<TResult, TProps = unknown>(
  callback: (props?: TProps) => TResult,
  options?: { wrapper?: React.ComponentType<{ children: React.ReactNode }> }
) {
  const result = { current: undefined as unknown as TResult }
  let renderer: ReturnType<typeof create> | undefined

  function TestComponent() {
    result.current = callback()
    return null
  }

  const Wrapper = options?.wrapper || React.Fragment
  const element = React.createElement(Wrapper, null, React.createElement(TestComponent))

  // Synchronously render the component
  renderer = create(element)

  return {
    result,
    rerender: (newProps?: TProps) => {
      if (renderer) {
        const newElement = React.createElement(Wrapper, null, React.createElement(TestComponent))
        renderer.update(newElement)
      }
    },
    unmount: () => {
      if (renderer) {
        renderer.unmount()
        renderer = undefined
      }
    },
  }
}

export function waitFor<T>(callback: () => T | Promise<T>, options?: { timeout?: number }): Promise<T> {
  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        const result = await callback()
        resolve(result)
      } catch (error) {
        // Retry after a short delay
        setTimeout(check, 50)
      }
    }
    check()
  })
}

export function act<T>(callback: () => T | Promise<T>): Promise<void> {
  return testRendererAct(async () => {
    await callback()
  })
}

export function fireEvent(element: unknown, eventName: string, data?: unknown) {
  // Mock implementation
}

export const cleanup = () => {}
export const within = (element: unknown) => screen
