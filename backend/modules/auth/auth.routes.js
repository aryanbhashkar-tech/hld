import express from 'express'
import {
  login,
  refresh,
  logout,
  getAllInterns,
} from "./auth.controller.js";
import { authenticate, authorizeRoles, policyAccepted } from "./auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.get("/interns",authenticate,  authorizeRoles("HR_ADMIN","SUPER_ADMIN"),getAllInterns);
authRouter.get("/profile", authenticate, (req, res) => {
  res.json({
    user: req.user,
  });
});



export default authRouter;