import { DMChannel, MessageEmbed, Permissions } from "discord.js";
import { Command, CommandGroup, CommandoClient, CommandoMessage } from "discord.js-commando";
// @ts-ignore
import { stripIndents } from "common-tags";

module.exports = class ReloadCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "reload",
            aliases: ["reloadcommand"],
            group: "commands",
            memberName: "reload",
            description: "Reloads a command or command group.",
            details: stripIndents`
                The argument must be the name/ID (partial or whole) of a command or command group.
                Providing a command group will reload all of the commands in that group.
                Only the bot owner(s) may use this command.
            `,
            examples: ["reload command"],
            ownerOnly: true,
            guarded: true,
            args: [
                {
                    key: "cmdOrGrp",
                    label: "command/group",
                    prompt: "Which command or group would you like to reload?",
                    type: "group|command"
                }
            ]
        });
    }

    async run(message: CommandoMessage, args: {cmdOrGrp: Command & CommandGroup}) {
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        const { cmdOrGrp } = args;
        const isCmd = Boolean(cmdOrGrp.groupID);
        cmdOrGrp.reload();

        let msg;
        if(this.client.shard) {
            try {
                await this.client.shard.broadcastEval(`
					const ids = [${this.client.shard.ids.join(',')}];
					if(!this.shard.ids.some(id => ids.includes(id))) {
						this.registry.${isCmd ? 'commands' : 'groups'}.get('${isCmd ? cmdOrGrp.name : cmdOrGrp.id}').reload();
					}
				`);
            } catch (error) {
                this.client.emit('warn', `Error when broadcasting command reload to other shards`);
				this.client.emit('error', error);
                msg = isCmd ? `Reloaded \`${cmdOrGrp.name}\` command, but failed to reload on other shards.` : `Reloaded all of the commands in the \`${cmdOrGrp.name}\` group, but failed to reload on other shards.`;
                await message.channel.send(embeds ? new MessageEmbed({
                    color: "#FF0000",
                    title: `Could not reload ${isCmd ? "command" : "group"}`,
                    description: msg
                }) : msg);
                return null;
            }
        }

        msg = isCmd ? `Reloaded \`${cmdOrGrp.name}\` command${this.client.shard ? ' on all shards' : ''}.` : `Reloaded all of the commands in the \`${cmdOrGrp.name}\` group${this.client.shard ? ' on all shards' : ''}.`;
        await message.channel.send(embeds ? new MessageEmbed({
            color: "#00FF00",
            title: "Reloaded command",
            description: msg
        }) : msg);
        return null;
    }
}