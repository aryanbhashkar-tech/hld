import express from 'express'
const attendanceRouter = express.Router();
import { checkInController, checkOutController } from "./attendance.controller.js";
import { authenticate } from '../auth/auth.middleware.js';

attendanceRouter.post("/check-in", authenticate, checkInController);
attendanceRouter.post("/check-out", authenticate, checkOutController);


export default attendanceRouter