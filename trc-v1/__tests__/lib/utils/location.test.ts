// Location Utilities Tests
import { fuzzCoordinates, calculateDistance, formatDistance } from '@/lib/utils/location';

describe('Location Utilities', () => {
  describe('fuzzCoordinates', () => {
    it('returns both exact and fuzzy coordinates', () => {
      const coords = { latitude: 37.7749, longitude: -122.4194 };
      const result = fuzzCoordinates(coords);

      expect(result.exact).toEqual(coords);
      expect(result.fuzzy.latitude).not.toEqual(coords.latitude);
      expect(result.fuzzy.longitude).not.toEqual(coords.longitude);
    });

    it('fuzzes coordinates within reasonable range (~2.5km)', () => {
      const coords = { latitude: 37.7749, longitude: -122.4194 };
      const result = fuzzCoordinates(coords);

      const latDiff = Math.abs(result.fuzzy.latitude - coords.latitude);
      const lngDiff = Math.abs(result.fuzzy.longitude - coords.longitude);

      // Should be within ~0.025 degrees
      expect(latDiff).toBeLessThan(0.03);
      expect(lngDiff).toBeLessThan(0.03);
    });
  });

  describe('calculateDistance', () => {
    it('calculates distance between two coordinates', () => {
      const coord1 = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco
      const coord2 = { latitude: 34.0522, longitude: -118.2437 }; // Los Angeles

      const distance = calculateDistance(coord1, coord2);

      // Distance between SF and LA is approximately 559 km
      expect(distance).toBeGreaterThan(500);
      expect(distance).toBeLessThan(600);
    });

    it('returns 0 for same coordinates', () => {
      const coord = { latitude: 37.7749, longitude: -122.4194 };
      const distance = calculateDistance(coord, coord);

      expect(distance).toBeCloseTo(0, 1);
    });
  });

  describe('formatDistance', () => {
    it('formats small distances correctly', () => {
      expect(formatDistance(0.5)).toBe('less than 1 km');
    });

    it('formats larger distances correctly', () => {
      expect(formatDistance(5)).toBe('within 5 km');
      expect(formatDistance(15.7)).toBe('within 16 km');
    });
  });
});
