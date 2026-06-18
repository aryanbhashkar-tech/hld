import pool from "../../config/db.js";

export async function assignShiftService({
    userId,
    shiftId,
    effectiveDate,
    assignedById,
    reason,
}) {
    const client =
        await pool.connect();
    try {
        await client.query("BEGIN");
        const previousResult =
            await client.query(
                `
        SELECT shift_id
        FROM shift_assignments
        WHERE user_id = $1
        ORDER BY effective_date DESC
        LIMIT 1
        `,
                [userId]
            );
        const previousShift =
            previousResult.rows[0];
        const result =
            await client.query(
                `
        INSERT INTO shift_assignments (
          user_id,
          shift_id,
          effective_date,
          assigned_by_id,
          reason,
          previous_shift_id
        )
        VALUES (
          $1,$2,$3,$4,$5,$6
        )
        RETURNING *
        `,
                [
                    userId,
                    shiftId,
                    effectiveDate,
                    assignedById,
                    reason ?? null,
                    previousShift?.shift_id || null,
                ]
            );
        await client.query("COMMIT");
        return result.rows[0];

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export const getMyShiftService =
    async (userId) => {

        try {

const result =
    await pool.query(
        `
        SELECT
          sa.id,
          sa.user_id,
          sa.effective_date,

          s.id AS shift_id,
          s.name,
          s.shift_type,
          s.start_time,
          s.end_time,
          s.duration_hours,
          s.grace_period_min,
          s.is_night_shift

        FROM shift_assignments sa

        INNER JOIN shifts s
        ON s.id = sa.shift_id

        WHERE sa.user_id = $1
        AND sa.effective_date <= CURRENT_DATE

        ORDER BY sa.effective_date DESC

        LIMIT 1
        `,
        [userId]
    );

            const shift =
                result.rows[0];

            if (!shift) {

                throw Object.assign(
                    new Error(
                        "No shift assigned"
                    ),
                    {
                        statusCode: 404,
                    }
                );

            }

            return shift;

        } catch (error) {

            console.log(
                "error from getMyShiftService ==",
                error
            );

            throw error;
        }
    };

export const getAllShiftsService =
    async () => {

        const result =
            await pool.query(
                `
        SELECT
          *
        FROM shifts
        ORDER BY start_time ASC
        `
            );

        return result.rows;
    };