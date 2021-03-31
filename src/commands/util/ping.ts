import { DMChannel, MessageEmbed, Permissions } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
// @ts-ignore
import { stripIndents } from "common-tags";

module.exports = class PingCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "ping",
            group: "util",
            memberName: "ping",
            description: "Checks the bot\'s ping to the Discord server.",
            throttling: {
                usages: 5,
                duration: 10
            },
            guarded: true
        });
    }

    async run(message: CommandoMessage) {
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        let embedMsg = new MessageEmbed({
            color: "#0000FF",
            title: "Ping",
            description: "Pinging..."
        });
        const pingMsg = await message.channel.send(embeds ? embedMsg : "Pinging...");
        const messageRoundTrip = (pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp);
        const heartbeat = this.client.ws.ping ? Math.round(this.client.ws.ping) : null;
        embedMsg
            .setTitle("Pong")
            .addField("Message round-trip", `${messageRoundTrip}ms`)
            .description = null;
        if(heartbeat) embedMsg.addField("Heartbeat", `${heartbeat}ms`);
        return pingMsg.edit(embeds ? embedMsg : stripIndents`
            Pong

            **Message round-trip**
            ${messageRoundTrip}ms
            **Heartbeat**
            ${heartbeat}ms
        `);
    }
}