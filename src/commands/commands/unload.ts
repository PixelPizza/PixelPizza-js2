import { DMChannel, MessageEmbed, Permissions } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
// @ts-ignore
import { stripIndents } from "common-tags";

module.exports = class UnloadCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "unload",
            aliases: ["unloadcommand"],
            group: "commands",
            memberName: "unload",
            description: "Unloads a command.",
            details: stripIndents`
                The argument must be the name/ID (partial or whole) of a command.
                Only the bot owner(s) may use this command.
            `,
            examples: ["unload command"],
            ownerOnly: true,
            guarded: true,
            args: [
                {
                    key: "command",
                    prompt: "Which command would you like to unload?",
                    type: "command"
                }
            ]
        });
    }

    async run(message: CommandoMessage, args: {command: Command}) {
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        args.command.unload();

        let description = `Unloaded \`${args.command.name}\` command${this.client.shard ? ' on all shards' : ''}.`;
        if(this.client.shard) {
            try {
                await this.client.shard.broadcastEval(`
                    const ids = [${this.client.shard.ids.join(',')}];
					if(!this.shard.ids.some(id => ids.includes(id))) {
						this.registry.commands.get('${args.command.name}').unload();
					}
                `);
            } catch (error) {
                this.client.emit("warn", "Error when broadcasting command unload to other shards");
                this.client.emit("error", error);
                description = `Unloaded \`${args.command.name}\` command, but failed to unload on other shards.`;
                await message.channel.send(embeds ? new MessageEmbed({
                    color: "#FF0000",
                    title: "Could not unload command",
                    description
                }) : description);
                return null;
            }
        }

        await message.channel.send(embeds ? new MessageEmbed({
            color: "#00FF00",
            title: "Unloaded command",
            description
        }) : description);
        return null;
    }
}