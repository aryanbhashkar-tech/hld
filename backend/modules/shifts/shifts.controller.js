import { assignShiftService, getMyShiftService,getAllShiftsService } from "./shifts.service.js";
export const assignShift =
    async (req, res) => {
        /*
        please please aryan bhashkar this side :
        if anyone else is working on this module
        than please fetch the previous shift id 
        also and pass it in the body and the reason 
        also  it makes more sense to have the reason 
        for shift change and also the previous shift id 
        for better tracking.
        */
        try {
            const {
                userId,
                shiftId,
                effectiveDate,
                reason,
            } = req.body;
            const assignedById =
                req.user.userId;
            const result =
                await assignShiftService({
                    userId,
                    shiftId,
                    effectiveDate,
                    reason,
                    assignedById,
                });
            return res.status(201).json({
                success: true,
                message:
                    "Shift assigned successfully",
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
export const getMyShift =
    async (req, res) => {
        try {
            const userId =
                req.user.userId;
            const shift =
                await getMyShiftService(
                    userId
                );
            return res.status(200).json({
                success: true,
                message:
                    "Shift fetched successfully",
                data: shift,
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
export const getAllShifts = async (
    req,
    res
) => {
    try {

        const shifts =
            await getAllShiftsService();

        return res.status(200).json({
            success: true,
            data: shifts,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal server error",
        });
    }
};