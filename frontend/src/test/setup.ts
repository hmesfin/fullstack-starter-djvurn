// Test setup file
import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

// Mock pointer capture methods for reka-ui Select component
// These methods are used by the Select component but not available in jsdom
beforeEach(() => {
  // Add hasPointerCapture and releasePointerCapture to HTMLElement prototype
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = function () {
      return false
    }
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = function () {
      // no-op
    }
  }
})
