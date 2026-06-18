import {getDistance} from 'geolib'

export const calculateDistanceMeters = (
    userLat,
    userLng,
    officeLat,
    officeLng
) => {
    return getDistance(
        {
            latitude: userLat,
            longitude: userLng,
        },
        {
            latitude: officeLat,
            longitude: officeLng,
        }
    );
};