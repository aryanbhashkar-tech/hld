import { LOCATION_PING_TYPES } from "../../utils/location.constants.js";
import { verifyFaceService } from "../face-verfication/face-verfication.service.js";
import { checkInService, checkOutService } from "./attendance.service.js";

export const checkInController = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("while debugging the issues of the face modules ",
      "please check whetherthe request recives the facetoken or not")
    const { faceToken, lat, lng, accuracy, isSpoofFlag } = req.body;
    const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress;
    await verifyFaceService({ userId, faceToken });
    const ping_type = LOCATION_PING_TYPES.CHECK_IN;
    const attendance = await checkInService({
      userId,
      lat,
      lng,
      accuracy,
      isSpoofFlag,
      ipAddress,
      ping_type
    })
    return res.status(201).json({
      success: true,
      message: "Check-in successful",
      data: attendance,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkOutController = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("while debugging the issues of the face modules ",
      "please check whether the request recives the facetoken or not")
    const { faceToken, lat, lng, accuracy, isSpoofFlag } = req.body;
    await verifyFaceService(
      {
        userId,
        faceToken,
      });
    const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress;
    const ping_type = LOCATION_PING_TYPES.CHECK_OUT;
    const attendance = await checkOutService({ userId, lat, lng, accuracy, ipAddress, isSpoofFlag, ping_type });
    return res.status(200).json({
      success: true,
      message: "Check-out successful",
      data: attendance,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};