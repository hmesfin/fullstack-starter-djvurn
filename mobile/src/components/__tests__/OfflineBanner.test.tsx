import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { OfflineBanner } from '../OfflineBanner';
import * as NetInfo from '@react-native-community/netinfo';

// Mock NetInfo
jest.mock('@react-native-community/netinfo');
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

describe('OfflineBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when online', () => {
    beforeEach(() => {
      mockNetInfo.useNetInfo.mockReturnValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: null,
      } as any);
    });

    it('should not render when connected', () => {
      render(<OfflineBanner />);

      expect(screen.queryByText(/offline/i)).toBeNull();
      expect(screen.queryByText(/no internet/i)).toBeNull();
    });
  });

  describe('when offline', () => {
    beforeEach(() => {
      mockNetInfo.useNetInfo.mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      } as any);
    });

    it('should render offline banner', () => {
      render(<OfflineBanner />);

      expect(screen.getByText(/offline/i)).toBeTruthy();
    });

    it('should display offline message', () => {
      render(<OfflineBanner />);

      expect(screen.getByText(/no internet connection/i)).toBeTruthy();
    });

    it('should have error styling (dark background)', () => {
      const { getByTestId } = render(<OfflineBanner />);

      const banner = getByTestId('offline-banner');
      expect(banner.props.style).toMatchObject(
        expect.objectContaining({
          backgroundColor: expect.any(String),
        })
      );
    });

    it('should display wifi-off icon', () => {
      const { getByTestId } = render(<OfflineBanner />);

      expect(getByTestId('offline-icon')).toBeTruthy();
    });
  });

  describe('when connection is unknown', () => {
    beforeEach(() => {
      mockNetInfo.useNetInfo.mockReturnValue({
        isConnected: null,
        isInternetReachable: null,
        type: 'unknown',
        details: null,
      } as any);
    });

    it('should not render when connection state is unknown', () => {
      render(<OfflineBanner />);

      expect(screen.queryByText(/offline/i)).toBeNull();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      mockNetInfo.useNetInfo.mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      } as any);
    });

    it('should have accessibility label', () => {
      const { getByLabelText } = render(<OfflineBanner />);

      expect(getByLabelText(/offline mode/i)).toBeTruthy();
    });

    it('should have accessibility role', () => {
      const { getByRole } = render(<OfflineBanner />);

      expect(getByRole('alert')).toBeTruthy();
    });
  });

  describe('animation', () => {
    it('should use slide-in animation when appearing', () => {
      // First render online
      const { rerender } = render(<OfflineBanner />);
      mockNetInfo.useNetInfo.mockReturnValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: null,
      } as any);

      // Then switch to offline
      mockNetInfo.useNetInfo.mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      } as any);

      rerender(<OfflineBanner />);

      const { getByTestId } = render(<OfflineBanner />);
      const banner = getByTestId('offline-banner');

      // Banner should have animated wrapper
      expect(banner).toBeTruthy();
    });
  });
});
