import bcrypt from 'bcryptjs'
import pool from '../../config/db.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, tokenExpiryDate } from '../../utils/jwt.js';
import logger from '../../utils/logger.js';
import { loggers } from 'winston';


logger.info("auth service loaded successfully")
export async function loginUser({ email, password, ipAddress, userAgent, deviceId }) {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [email]
    );
    const user = result.rows[0];
    console.log("user == ", user);
    // logger.info(
    //   `Login attempt for email: ${email}`,
    //   { user }
    // );
    if (!user || !user.is_active) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }
    const payload = { userId: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ userId: user.id });
    const faceRegistered = user.face_registered;
    console.log("face registered from the login == ", faceRegistered);
    // logger.info(`refresh token: ${refreshToken}`);
    // logger.info(`access token: ${accessToken}`);
    // console.log("refresh token == ", refreshToken);
    await pool.query(
      `
  INSERT INTO refresh_tokens (
    token,
    user_id,
    device_id,
    ip_address,
    user_agent,
    expires_at
  )
  VALUES ($1,$2,$3,$4,$5,$6)
  `,
      [
        refreshToken,
        user.id,
        deviceId ?? null,
        ipAddress ?? null,
        userAgent ?? null,
        tokenExpiryDate(
          process.env.JWT_REFRESH_EXPIRES_IN
        ),
      ]
    );
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        policy_accepted_at: user.policy_accepted_at,
        requiresFaceEnrollment:
          !faceRegistered,
        face_registered: faceRegistered
      },
    };
  } catch (error) {
    throw error;
  }
}


export async function refreshSession({
  refreshToken: token,
  ipAddress,
  userAgent,
}) {

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw Object.assign(
      new Error(
        "Invalid or expired refresh token"
      ),
      {
        statusCode: 401,
      }
    );
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const tokenResult = await client.query(
      `
            SELECT *
            FROM refresh_tokens
            WHERE token = $1
            LIMIT 1
            `,
      [token]
    );
    const stored = tokenResult.rows[0];
    console.log("Stored token == ", stored);
    if (
      !stored ||
      stored.revoked_at ||
      new Date() > stored.expires_at
    ) {

      throw Object.assign(
        new Error(
          "Refresh token revoked or expired"
        ),
        {
          statusCode: 401,
        }
      );
    }
    const userResult = await client.query(
      `
            SELECT
                id,
                role
            FROM users
            WHERE id = $1
            LIMIT 1
            `,
      [decoded.userId]
    );
    const user = userResult.rows[0];
    console.log("user == ", user);
    /*
    in this addd the user.is_active check
    when things are working fine for 
    now just keep on with the !user
    */
    if (!user) {
      throw Object.assign(
        new Error("Account deactivated"),
        {
          statusCode: 401,
        }
      );
    }
    const newAccessToken =
      signAccessToken({
        userId: user.id,
        role: user.role,
      });
    const newRefreshToken =
      signRefreshToken({
        userId: user.id,
      });
    await client.query(
      `
            UPDATE refresh_tokens
            SET revoked_at = NOW()
            WHERE id = $1
            `,
      [stored.id]
    );
    await client.query(
      `
            INSERT INTO refresh_tokens (
                token,
                user_id,
                device_id,
                ip_address,
                user_agent,
                expires_at
            )
            VALUES (
                $1,$2,$3,$4,$5,$6
            )
            `,
      [
        newRefreshToken,
        user.id,
        stored.device_id,
        ipAddress ?? null,
        userAgent ?? null,
        tokenExpiryDate(
          process.env.JWT_REFRESH_EXPIRES_IN
        ),
      ]
    );
    await client.query("COMMIT");
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;

  } finally {

    client.release();
  }
}

export async function logoutUser({
  refreshToken: token,
  userId,
}) {

  if (token) {
    await pool.query(
      `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE token = $1
      AND user_id = $2
      `,
      [token, userId]
    );

    return;
  }
  await pool.query(
    `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE user_id = $1
    AND revoked_at IS NULL
    `,
    [userId]
  );
}

export async function acceptPolicy({
  userId,
}) {
  const result = await pool.query(
    `
    UPDATE users
    SET policy_accepted_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      policy_accepted_at
    `,
    [userId]
  );
  return result.rows[0];
}


export const getAllInternsService = async () => {
  try {

    const result = await pool.query(
      `
      SELECT
        *
      FROM users
      WHERE role = 'INTERN'
      ORDER BY name ASC
      `
    );

    return result.rows;

  } catch (error) {
    throw error;
  }
};