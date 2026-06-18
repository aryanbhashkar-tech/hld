import express from "express";
import { assignShift, getMyShift, getAllShifts } from "./shifts.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { authorizeRoles } from "../auth/auth.middleware.js";
const shiftrouter = express.Router();
shiftrouter.post(
    "/assign",
    authenticate,
    authorizeRoles(
        "HR_ADMIN",
        "SUPER_ADMIN"
    ),
    assignShift
)
/*this get request is for intern to check what is his shift */
shiftrouter.get('/my-shift', authenticate, getMyShift);
shiftrouter.get('/all-shifts', authenticate, authorizeRoles("HR_ADMIN", "SUPER_ADMIN"), getAllShifts);
export default shiftrouter;