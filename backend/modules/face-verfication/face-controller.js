import { enrollFaceService } from "./face-verfication.service";
import { verifyFaceService } from "./face-verfication.service";
export const enrollFaceController =
    async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { faceId } = req.body;
            const result =
                await enrollFaceService({
                    userId,
                    faceId,
        });
            return res.status(201).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

export const verifyFaceController =
    async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { faceToken } = req.body;
            const result =
                await verifyFaceService({
                    userId,
                    faceToken,
                });
            return res.status(200).json({
                success: true,
                verified:
                    result.verified,
            });
        } catch (error) {
            next(error);
        }
    };