import dotenv from 'dotenv'
dotenv.config();
import jwt from 'jsonwebtoken';


export const generateAccessToken = (user) => {
  console.log("Generating access token for user == ", user);
  return jwt.sign(
    {
      userId: user.id,
      role:user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};