import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();



console.log("JWT ACCESS BEEN CALLEDDD == ", process.env.JWT_ACCESS_SECRET);
export const signAccessToken = (
  payload
) => {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn:
        process.env.JWT_ACCESS_EXPIRES ||
        "15m",
    }
  );
};
export const signRefreshToken = ({
  userId,
}) => {
  // console.log("Signing refresh token for userId == ", userId);
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn:
        process.env.JWT_REFRESH_EXPIRES || "7d",
    }
  );
};

export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );

    return decoded;
  } catch (error) {
    return null;
  }
};
export const tokenExpiryDate = () => {
  const days =
    parseInt(process.env.REFRESH_TOKEN_DAYS) || 7;

  const expiryDate = new Date();

  expiryDate.setDate(
    expiryDate.getDate() + days
  );

  return expiryDate;
};