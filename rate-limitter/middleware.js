import { redis } from "./lib/rate-limiter.js";

export const rateMiddleware = async (req, res, next) => {
    try {
        const curr_count = await redis.get('count');
        const startedAtStr = await redis.get('time');
        if (!curr_count || !startedAtStr) {
            await redis.setnx('count', 0);
            await redis.setnx('time', Date.now().toString());
            next();
        }
        const startedAt = parseInt(startedAtStr, 10);
        const now = Date.now();
        const elapsedMs = now - startedAt;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        console.log("elapsedMs from the middleware ", elapsedMs);
        console.log("current count === ", parseInt(curr_count, 10));
        if (parseInt(curr_count, 10) >= 10) {
            return res.status(403).json({ msg: "hitting more than y deserve" });
        }
        if (elapsedSeconds > 60) {
            await redis.set('time', Date.now().toString());
            await redis.set('count', 0);
        }
        next();
    } catch (e) {
        next(e);
    }
}