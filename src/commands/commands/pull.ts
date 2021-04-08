import * as fs from "fs";
import { BotConfig } from "../../api";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { exec } from "child_process";
import { Message, DMChannel, Permissions, MessageEmbed } from "discord.js";
// @ts-ignore
import {stripIndents} from "common-tags";

const pullurl = fs.existsSync("data/_config.json") ? (require("../../../data/_config") as BotConfig).pullurl : process.env.PULL_URL;

module.exports = class PullCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "pull",
            description: "Pull the code from github",
            group: "commands",
            memberName: "pull",
            aliases: ["pullcode"],
            details: "Only the bot owner(s) may use this command.",
            guarded: true,
            hidden: true,
            ownerOnly: true
        });
    }

    async run(message: CommandoMessage){
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        const pullMsg = await message.channel.send(embeds ? new MessageEmbed({
            color: "#0000FF",
            title: "Pull",
            description: "Pulling"
        }) : stripIndents`
            **Pull**
            Pulling
        `);
        return await new Promise<Message>((resolve, reject) => exec(`git pull ${pullurl}`, function(error, stdout, stderr){
            if(error) {
                pullMsg.edit(embeds ? new MessageEmbed({
                    color: "#FF0000",
                    title: "Pull",
                    description: "Failed pulling"
                }) : stripIndents`
                    **Pull**
                    Failed pulling
                `);
                return reject(error);
            }
            console.log("done pulling", stdout, stderr);
            resolve(pullMsg.edit(embeds ? new MessageEmbed({
                color: "#00FF00",
                title: "Pull",
                description: "Done pulling"
            }) : stripIndents`
                **Pull**
                Done pulling
            `));
        }));
    }
}