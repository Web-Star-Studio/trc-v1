// Location utilities with privacy-preserving fuzzing
import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface FuzzedCoordinates {
  exact: Coordinates;
  fuzzy: Coordinates;
}

/**
 * Request location permission and get current location
 */
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return location;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

/**
 * Fuzz coordinates to ~2-3km radius for privacy
 */
export function fuzzCoordinates(coords: Coordinates): FuzzedCoordinates {
  // Approximately 0.025 degrees ~ 2.5 km
  const fuzzAmount = 0.025;
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomDistance = Math.random() * fuzzAmount;

  const fuzzyLat = coords.latitude + randomDistance * Math.sin(randomAngle);
  const fuzzyLng = coords.longitude + randomDistance * Math.cos(randomAngle);

  return {
    exact: coords,
    fuzzy: {
      latitude: fuzzyLat,
      longitude: fuzzyLng,
    },
  };
}

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display (e.g., "within 3 km")
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return 'less than 1 km';
  }
  return `within ${Math.round(km)} km`;
}
