import {Client, FriendlyError, SQLiteProvider} from "discord.js-commando";
import { BotConfig } from "./api";
import * as fs from "fs";
import * as path from "path";
import * as sqlite from "sqlite";
import * as sqlite3 from "sqlite3";

const token = fs.existsSync("data/_config.json") ? (require("../data/_config") as BotConfig).token : process.env.BOT_TOKEN;

const client = new Client({
    owner: [
        "472312270047674378",
        "596012554598481977",
        "511209271678074891"
    ],
    commandPrefix: "!pp"
});

client
    .on("error", console.error)
    .on("warn", console.warn)
    .on("debug", console.log)
    .on("ready", () => {
        // TODO go through multiple activities
        client.user?.setActivity({name: "!pphelp", type: "PLAYING"});
        console.log("Client is ready!");
    })

client.setProvider(
    sqlite.open({filename: "database.db", driver: sqlite3.Database}).then(db => new SQLiteProvider(db))
).catch(console.error);

client.login(token);