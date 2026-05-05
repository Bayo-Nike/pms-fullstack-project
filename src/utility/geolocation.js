/**
 * Professional Geolocation Utility
 * Uses High Accuracy (GPS hardware) with a timeout fallback
 */
export const getCurrentGPS = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported by browser"));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude.toFixed(7),
                    longitude: position.coords.longitude.toFixed(7)
                });
            },
            (error) => {
                let message = "GPS Error";
                if (error.code === 1) message = "Location permission denied";
                if (error.code === 3) message = "GPS request timed out";
                reject(new Error(message));
            },
            options
        );
    });
};