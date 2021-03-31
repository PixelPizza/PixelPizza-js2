import * as fs from "fs";
import { DMChannel, MessageEmbed, Permissions } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
// @ts-ignore
import { stripIndents } from "common-tags";

module.exports = class LoadCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "load",
            aliases: ["loadcommand"],
            group: "commands",
            memberName: "load",
            description: "Loads a new command.",
            details: stripIndents`
                The argument must be full name of the command in the format of \`group:memberName\`.
                Only the bot owner(s) may use this command.
            `,
            examples: ["load command"],
            ownerOnly: true,
            guarded: true,
            args: [
                {
                    key: "command",
                    prompt: "Which command would you like to load?",
                    validate: (val: string) => new Promise(resolve => {
						if(!val) return resolve(false);
						const split = val.split(':');
						if(split.length !== 2) return resolve(false);
						if(this.client.registry.findCommands(val).length > 0) {
							return resolve('That command is already registered.');
						}
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						fs.access(cmdPath, fs.constants.R_OK, err => err ? resolve(false) : resolve(true));
						return null;
					}),
					parse: (val: string) => {
						const split = val.split(':');
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						delete require.cache[cmdPath];
						return require(cmdPath);
					}
                }
            ]
        });
    }

    async run(message: CommandoMessage, args: {command: Command}) {
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        this.client.registry.registerCommand(args.command);
        const command = this.client.registry.commands.last();

        if(!command) return null;

        let embedMsg: MessageEmbed;
        if(this.client.shard) {
            try {
                await this.client.shard.broadcastEval(`
                    const ids = [${this.client.shard.ids.join(",")}];
                    if(!this.shard.ids.some(id => ids.includes(id))) {
                        const cmdPath = this.registry.resolveCommandPath('${command.groupID}', '${command.name}');
                        delete require.cache[cmdPath];
                        this.registry.registerCommand(require(cmdPath));
                    }
                `);
            } catch (error) {
                this.client.emit("warn", "Error when broadcasting command load to other shards");
                this.client.emit("error", error);
                embedMsg = new MessageEmbed({
                    color: "#FF0000",
                    title: "Could not load command",
                    description: `Loaded \`${command.name}\` command, but failed to load on other shards.`
                });
                if(embedMsg.description) await message.channel.send(embeds ? embedMsg : embedMsg.description);
                return null;
            }
        }

        embedMsg = new MessageEmbed({
            color: "#00FF00",
            title: "Command loaded",
            description: `Loaded \`${command.name}\` command${this.client.shard ? ' on all shards' : ''}.`
        });
        if(embedMsg.description) await message.channel.send(embeds ? embedMsg : embedMsg.description);
        return null;
    }
}