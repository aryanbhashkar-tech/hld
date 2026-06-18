import express from 'express'
export const faceVerificationMiddleware =
  async (req, res, next) => {
    try {
      const faceVerified =
        req.faceVerified;

      if (!faceVerified) {
        return res.status(401).json({
          message:
            "Face verification required",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };