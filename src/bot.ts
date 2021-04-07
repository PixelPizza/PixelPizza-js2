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
        "511209271678074891",
        "348591213953417218",
        "485089214027923462"
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
    // @ts-ignore
    .on("commandError", (command, error) => {
        if(error instanceof FriendlyError) return;
        console.error(`Error in command ${command.groupID}:${command.memberName}`, error);
    })
    // @ts-ignore
    .on("commandBlock", (message, reason) => {
        console.log(`Command ${message.command ? `${message.command.groupID}:${message.command.memberName}` : ""} blocked`, reason);
    })
    .on("commandStatusChange", (guild, command, enabled) => {
        console.log(`Command ${command.groupID}:${command.memberName} ${enabled ? "enabled" : "disabled"} ${guild ? `in ${guild.name}` : "globally"}`);
    })
    .on("groupStatusChange", (guild, group, enabled) => {
        console.log(`Group ${group.id} ${enabled ? "enabled" : "disabled"} ${guild ? `in guild ${guild.name}` : "globally"}`);
    });

client.setProvider(
    sqlite.open({filename: "database.db", driver: sqlite3.Database}).then(db => new SQLiteProvider(db))
).catch(console.error);

client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerGroups([
        {
            id: "rules",
            name: "Rules",
            guarded: true
        },
        {
            id: "other",
            name: "Other"
        }
    ])
    .registerCommandsIn(path.join(__dirname, "commands"));

client.login(token);