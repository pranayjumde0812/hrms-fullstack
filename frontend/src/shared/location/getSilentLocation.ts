export type SilentLocation = {
  latitude: number;
  longitude: number;
};

export async function getSilentLocation(): Promise<SilentLocation | null> {
  if (
    typeof window === 'undefined' ||
    !('navigator' in window) ||
    !navigator.geolocation ||
    !navigator.permissions
  ) {
    return null;
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    if (permission.state !== 'granted') {
      return null;
    }

    return await new Promise<SilentLocation | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => resolve(null),
        {
          enableHighAccuracy: false,
          maximumAge: 5 * 60 * 1000,
          timeout: 5000,
        },
      );
    });
  } catch {
    return null;
  }
}
