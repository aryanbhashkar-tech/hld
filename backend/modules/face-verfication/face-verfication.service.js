import pool from "../../config/db.js";

export const enrollFaceService =
    async (
       { userId,
        faceId},
    ) => {
        const query = `
      INSERT INTO user_face_profiles (
        user_id,
        face_id
      )
      VALUES ($1, $2)

      ON CONFLICT (user_id)

      DO UPDATE SET
      face_id = EXCLUDED.face_id,
      updated_at = NOW()

      RETURNING *
    `;

        const result =
            await pool.query(query, [
                userId,
                faceId,
            ]);

        await pool.query(
            `
      UPDATE users
      SET face_registered = true
      WHERE id = $1
      `,
            [userId]
        );

        return result.rows[0];
    };


export const verifyFaceService =
    async (
       { userId,
        faceToken},
    ) => {
        /* here some backend work needs to be done from the sdk that we will use*/
        const faceMatched = true;

        if (!faceMatched) {
            throw new Error(
                "Face verification failed"
            );
        }

        return {
            verified: true,
        };
    };