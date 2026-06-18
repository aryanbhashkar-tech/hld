import pool from "../../config/db.js";
import { calculateDistanceMeters } from "../../utils/geo.utils.js";

export const validateUserLocationService = async (
    { lat,
        lng,
        accuracy,
        isSpoofFlag,
    }) => {
    if (isSpoofFlag) {
        throw new Error("Spoofed location detected");
    }
    if (accuracy > 100) {
        throw new Error("Location accuracy too low");
    }
    const officeResult = await pool.query(
        `
        SELECT *
        FROM organization_locations
        WHERE is_active = TRUE
        LIMIT 1
        `
    );
    if (officeResult.rows.length === 0) {
        throw new Error("Organization location not configured");
    }
    const office = officeResult.rows[0];
    const distance = calculateDistanceMeters(
        lat,
        lng,
        office.latitude,
        office.longitude
    );
    const isWithinRadius =
        distance <= office.allowed_radius_meters;
    if (!isWithinRadius) {
        throw new Error(
            `You are outside office radius (${distance}m away)`
        );
    }
    return {
        valid: true,
        office,
        distance,
    };
};

export const createLocationPingService = async ({
    userId,
    attendanceId,
    lat,
    lng,
    accuracy,
    ipAddress,
    isSpoofFlag,
    client,
    ping_type
}) => {
    try {
        const result = await client.query(
            `
            INSERT INTO location_pings (
                user_id,
                attendance_id,
                lat,
                lng,
                accuracy,
                ip_address,
                is_spoof_flag,
                ping_type
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7,$8)
            RETURNING *
            `,
            [
                userId,
                attendanceId,
                lat,
                lng,
                accuracy,
                ipAddress,
                isSpoofFlag,
                ping_type
            ]
        );
        return result.rows[0];
    } catch (e) {
        console.log("error from the create Location ping service", e);
        throw Error(e);
    }
};