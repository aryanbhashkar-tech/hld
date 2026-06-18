import dotenv from "dotenv";
dotenv.config();
import logger from '../../utils/logger.js';
import jwt from "jsonwebtoken";
import pool from "../../config/db.js"

export const authenticate =
  async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      console.log("auth header from the auth middleware == ", authHeader)
      if (
        !authHeader ||
        !authHeader.startsWith(
          "Bearer "
        )
      ) {
        // console.log("Access token missing in the auth middleware")
        return res.status(401).json({
          success: false,
          message:
            "Access token missing",
        });
      }
      const token = authHeader.split(" ")[1];
      console.log("Token extracted from header == ", token)
      console.log("JWT Access Secret in auth middleware == ", process.env.JWT_ACCESS_SECRET)
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
      );

      console.log("decoded user ==", decoded)
      const result = await pool.query(
        `
        SELECT
          id,
          email,
          role,
          is_active,
          policy_accepted_at
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [decoded.userId]
      );
      const user =
        result.rows[0];
      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "User not found",
        });
      }
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message:
            "Account disabled",
        });
      }
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
        policyAcceptedAt:
          user.policy_accepted_at,
      };
      next();
    } catch (error) {
      console.log("JWT ERROR ==>", error);

      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  };
export const authorizeRoles =
  (...roles) => {
    return (
      req,
      res,
      next
    ) => {

      if (
        !roles.includes(
          req.user.role
        )
      ) {
        return res.status(403).json({
          success: false,

          message:
            "Forbidden",
        });
      }

      next();
    };
  };
export const policyAccepted =
  (
    req,
    res,
    next
  ) => {
    if (
      !req.user.policyAcceptedAt
    ) {
      return res.status(403).json({
        success: false,

        message:
          "Attendance policy not accepted",
      });
    }
    next();
  };