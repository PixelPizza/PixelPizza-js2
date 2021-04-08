import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { exec } from "child_process";
import { Message, DMChannel, Permissions, MessageEmbed } from "discord.js";

module.exports = class BuildCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "build",
            description: "",
            group: "commands",
            memberName: "build",
            details: "Only the bot owner(s) may use this command.",
            guarded: true,
            hidden: true,
            ownerOnly: true
        });
    }

    async run(message: CommandoMessage) {
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        return await new Promise<Message>((resolve, reject) => exec("npm run build", function(error, stdout, stderr){
            if(error) reject(error);
            console.log("done building", stdout, stderr);
            resolve(message.channel.send(embeds ? new MessageEmbed({
                color: "#00FF00",
                description: "Done building"
            }) : "Done building"));
        }));
    }
}