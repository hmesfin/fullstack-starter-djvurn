import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useNetworkState } from '@/hooks/useNetworkState';

/**
 * OfflineBanner component
 *
 * Displays a banner at the top of the screen when the device is offline.
 * Uses slide-in animation when appearing and disappearing.
 *
 * Features:
 * - Automatically detects network state
 * - Animated slide-in/out transitions
 * - Accessibility support (role="alert", aria-label)
 * - Material Design styling (error color)
 */
export const OfflineBanner: React.FC = () => {
  const { isConnected } = useNetworkState();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  // Animate banner in/out based on connection state
  useEffect(() => {
    if (isConnected === false) {
      // Slide in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (isConnected === true) {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, slideAnim]);

  // Don't render if connection state is unknown or connected
  if (isConnected !== false) {
    return null;
  }

  return (
    <Animated.View
      testID="offline-banner"
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLabel="Offline mode: No internet connection"
    >
      <View style={styles.content}>
        <IconButton
          testID="offline-icon"
          icon="wifi-off"
          iconColor="#fff"
          size={20}
          style={styles.icon}
        />
        <Text style={styles.text}>No Internet Connection</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d32f2f', // Material Design error color
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    margin: 0,
    marginRight: -8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
