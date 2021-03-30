import * as fs from "fs";
import * as path from "path";
import { Shard, ShardingManager } from "discord.js";
import { BotConfig } from "./api";

const token = fs.existsSync("data/_config.json") ? (require("../data/_config") as BotConfig).token : process.env.BOT_TOKEN;

const manager = new ShardingManager(path.join(__dirname, "bot.js"), {
    token,
    mode: "worker"
});

const logEvent = (event: string, shard: Shard) => console.log(`----- SHARD ${shard.id} ${event} -----`);

manager.on("shardCreate", shard => {
    logEvent("LAUNCHED", shard);
    shard
        .on("death", () => logEvent("DIED", shard))
        .on("ready", () => logEvent("READY", shard))
        .on("disconnect", () => logEvent("DISCONNECTED", shard))
        .on("reconnecting", () => logEvent("RECONNECTING", shard));
});

manager.spawn().catch(console.error);