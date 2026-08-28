import * as Location from "expo-location";

export type CurrentLocation = {
  latitude: number;
  longitude: number;
};

export class LocationRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocationRequestError";
  }
}

export async function getCurrentLocation(): Promise<CurrentLocation> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== Location.PermissionStatus.GRANTED) {
    throw new LocationRequestError(
      permission.canAskAgain
        ? "Location permission is required. Allow location access and try again."
        : "Location permission is blocked. Enable it in your device settings and try again.",
    );
  }

  if (!(await Location.hasServicesEnabledAsync())) {
    throw new LocationRequestError("Location services are turned off. Turn them on and try again.");
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    throw new LocationRequestError("We could not detect your location. Please try again.");
  }
}
