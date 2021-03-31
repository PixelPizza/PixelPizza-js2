import { DMChannel, MessageEmbed, Permissions } from "discord.js";
import { CommandoClient, CommandoMessage, Command } from "discord.js-commando";
// @ts-ignore
import { stripIndents } from "common-tags";

module.exports = class GroupsCommand extends Command {
    constructor(client: CommandoClient){
        super(client, {
            name: "groups",
            aliases: ["listgroups", "showgroups"],
            group: "commands",
            memberName: "groups",
            description: "Lists all command groups.",
            details: "Only administrators may use this command.",
            guarded: true
        });
    }

    // @ts-ignore
    hasPermission(message: CommandoMessage) {
        if(!message.guild) return this.client.isOwner(message.author);
        return message.member?.hasPermission(Permissions.FLAGS.ADMINISTRATOR) || this.client.isOwner(message.author);
    }

    run(message: CommandoMessage) {
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        const groups = this.client.registry.groups.map(group => 
            `**${group.name}:** ${group.isEnabledIn(message.guild) ? "Enabled" : "Disabled"}`
        ).join("\n");
        return message.channel.send(embeds ? new MessageEmbed({
            color: "#0000FF",
            title: "Groups",
            description: groups
        }) : stripIndents`
            ***Groups***
            ${groups}
        `);
    }
}