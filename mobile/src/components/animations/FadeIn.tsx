import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

/**
 * FadeIn animation component props
 */
interface FadeInProps {
  /**
   * Child components to animate
   */
  children: React.ReactNode;

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
   * Additional styles to apply
   */
  style?: ViewStyle;
}

/**
 * FadeIn animation component
 *
 * Smoothly fades in children when mounted.
 *
 * Usage:
 * ```tsx
 * <FadeIn duration={500} delay={100}>
 *   <Text>This will fade in!</Text>
 * </FadeIn>
 * ```
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = 300,
  delay = 0,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
