import { redis } from "./lib/rate-limiter.js";

export const rateMiddleware = async (req, res, next) => {
    try {
        const ip=req.ip;
        console.log("ip == ",ip)
        const curr_count = await redis.get(`rl-${ip}-count`);
        const startedAtStr = await redis.get(`rl-${ip}-time`);
        if (!curr_count) {
            await redis.setnx(`rl-${ip}-count`, 0);
        }
        if (!startedAtStr) {
            await redis.setnx(`rl-${ip}-time`, Date.now().toString());
        }
        const startedAt = parseInt(startedAtStr, 10);
        const now = Date.now();
        const elapsedMs = now - startedAt;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        console.log("seconds == ", elapsedSeconds);
        console.log("count == ", parseInt(curr_count, 10));
        if (parseInt(curr_count, 10) >= 10 && elapsedSeconds < 60) {
            return res.status(429).json({ msg: "hitting more than y deserve" });
        }
        if (elapsedSeconds > 60) {
            await redis.set(`rl-${ip}-time`, Date.now().toString());
            await redis.set(`rl-${ip}-count`, 0);
            // return res.status(429).json({msg:"limit resets"});
        }
        await redis.incr(`rl-${ip}-count`);
        next();
    } catch (e) {
        next(e);
    }
}