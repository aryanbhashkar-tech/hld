import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken } from './auth.util.js'
import { asyncHandler } from '../../utils/async-handler.js';
import { loginUser, logoutUser, refreshSession, getAllInternsService } from './auth.service.js'
import pool from '../../config/db.js';
export const login = asyncHandler(async (req, res) => {
    const validatedData = req.body;
    const result = await loginUser({
      ...validatedData,
      ip_Address: req.ip,
      userAgent: req.headers["user-agent"],
    });
    res.cookie(
      "refreshToken",
      result.refreshToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge:
          7 * 24 * 60 * 60 * 1000,
      }
    );
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    })
});

export const refresh = async (req, res) => {

  try {
    const refreshToken =
      req.cookies.refreshToken;
    console.log("refresh Token == ", refreshToken);
    if (!refreshToken) {

      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }
    const result = await refreshSession({
      refreshToken,
      ipAddress: req.ip,
      userAgent:
        req.headers["user-agent"],
    });
    res.cookie(
      "refreshToken",
      result.refreshToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge:
          7 * 24 * 60 * 60 * 1000,
      }
    );
    delete result.refreshToken;
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken =
      req.cookies.refreshToken;
    if (refreshToken) {
      await pool.query(
        `
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE token = $1
        `,
        [refreshToken]
      );
    }
    res.clearCookie("refreshToken");
    await logoutUser(refreshToken);
    await pool.query(`UPDATE refresh_tokens
SET revoked_at = NOW()
WHERE token = $1;`, [refreshToken]);
    res.clearCookie("refreshToken");
    return res.status(200).json({
      success: true,
      message: "Logged out",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllInterns = async (req, res) => {
  try {
    const interns = await getAllInternsService();

    return res.status(200).json({
      success: true,
      message: "Interns fetched successfully",
      data: interns,
    });

  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });
  }
};