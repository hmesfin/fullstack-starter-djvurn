/**
 * Mock implementation of React Native for testing
 * This provides the necessary React Native APIs without the full RN environment
 */

export const Platform = {
  OS: 'ios' as const,
  Version: '14.0',
  select: <T,>(obj: { ios?: T; android?: T; default?: T }): T | undefined =>
    obj.ios ?? obj.default,
}

export const StyleSheet = {
  create: <T,>(styles: T): T => styles,
  flatten: (style: unknown) => style,
  compose: (style1: unknown, style2: unknown) => [style1, style2],
  absoluteFill: {},
  hairlineWidth: 1,
}

export const Dimensions = {
  get: () => ({ width: 375, height: 667, scale: 2, fontScale: 1 }),
  set: () => {},
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
}

export const View = 'View'
export const Text = 'Text'
export const Image = 'Image'
export const ScrollView = 'ScrollView'
export const TouchableOpacity = 'TouchableOpacity'
export const TextInput = 'TextInput'
export const Button = 'Button'
export const FlatList = 'FlatList'
export const SectionList = 'SectionList'
export const ActivityIndicator = 'ActivityIndicator'

export const Animated = {
  Value: function (value: number) {
    return { value }
  },
  timing: () => ({
    start: (callback?: () => void) => callback?.(),
  }),
  spring: () => ({
    start: (callback?: () => void) => callback?.(),
  }),
  View: 'Animated.View',
  Text: 'Animated.Text',
  createAnimatedComponent: (component: unknown) => component,
}

export const Easing = {
  linear: (t: number) => t,
  ease: (t: number) => t,
  quad: (t: number) => t * t,
  cubic: (t: number) => t * t * t,
  in: (easing: (t: number) => number) => easing,
  out: (easing: (t: number) => number) => easing,
  inOut: (easing: (t: number) => number) => easing,
}

export const Alert = {
  alert: () => {},
}

export const AppState = {
  currentState: 'active',
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
}

export const Linking = {
  openURL: () => Promise.resolve(),
  canOpenURL: () => Promise.resolve(true),
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
}
