import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

/**
 * Slide direction
 */
export type SlideDirection = 'left' | 'right' | 'top' | 'bottom';

/**
 * SlideIn animation component props
 */
interface SlideInProps {
  /**
   * Child components to animate
   */
  children: React.ReactNode;

  /**
   * Direction to slide in from
   * @default 'bottom'
   */
  direction?: SlideDirection;

  /**
   * Animation duration in milliseconds
   * @default 300
   */
  duration?: number;

  /**
   * Delay before animation starts in milliseconds
   * @default 0
   */
  delay?: number;

  /**
   * Distance to slide in pixels
   * @default 50
   */
  distance?: number;

  /**
   * Additional styles to apply
   */
  style?: ViewStyle;
}

/**
 * SlideIn animation component
 *
 * Smoothly slides in children from a specified direction when mounted.
 *
 * Usage:
 * ```tsx
 * <SlideIn direction="bottom" duration={500} distance={100}>
 *   <Text>This will slide in from bottom!</Text>
 * </SlideIn>
 * ```
 */
export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'bottom',
  duration = 300,
  delay = 0,
  distance = 50,
  style,
}) => {
  const slideAnim = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, duration, delay]);

  // Determine which axis to animate based on direction
  const getTransform = (): ViewStyle => {
    switch (direction) {
      case 'left':
        return { transform: [{ translateX: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }] };
      case 'right':
        return { transform: [{ translateX: slideAnim }] };
      case 'top':
        return { transform: [{ translateY: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }] };
      case 'bottom':
      default:
        return { transform: [{ translateY: slideAnim }] };
    }
  };

  return (
    <Animated.View
      style={[
        style,
        getTransform(),
      ]}
    >
      {children}
    </Animated.View>
  );
};
