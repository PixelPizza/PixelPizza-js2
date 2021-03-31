import { DMChannel, MessageEmbed, Permissions } from "discord.js";
import { CommandoClient, CommandoMessage, Command, CommandGroup } from "discord.js-commando";
// @ts-ignore
import { stripIndents } from "common-tags";

module.exports = class EnableCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "enable",
            aliases: ["enablecommand", "cmdon", "commandon"],
            group: "commands",
            memberName: "enable",
            description: "Enables a command or command group.",
            details: stripIndents`
                The argument must be the name/ID (partial or whole) of a command or command group.
                Only administrators may use this command.
            `,
            examples: ["enable util", "enable Utility", "enable help"],
            guarded: true,
            args: [
                {
                    key: "cmdOrGrp",
                    label: "command/group",
                    prompt: "Which command or group would you like to enable?",
                    type: "group|command"
                }
            ]
        });
    }

    // @ts-ignore
    hasPermission(message: CommandoMessage) {
        if(!message.guild) return this.client.isOwner(message.author);
        return message.member?.hasPermission(Permissions.FLAGS.ADMINISTRATOR) || this.client.isOwner(message.author);
    }

    run(message: CommandoMessage, args: {cmdOrGrp: Command & CommandGroup}) {
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        const group = args.cmdOrGrp.group;
        let description = `Enabled the \`${args.cmdOrGrp.name}\` ${group ? 'command' : 'group'}${
            group && !group.isEnabledIn(message.guild) ?
            `, but the \`${group.name}\` group is disabled, so it still can't be used` :
            ''
        }.`;
        if(args.cmdOrGrp.isEnabledIn(message.guild, true)) {
            description = `The \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'} is already enabled${
                group && !group.isEnabledIn(message.guild) ?
                `, but the \`${group.name}\` group is disabled, so it still can't be used` :
                ''
            }.`;
            return message.channel.send(embeds ? new MessageEmbed({
                color: "#0000FF",
                title: `${group ? "Command" : "Group"} enabled`,
                description
            }) : description);
        }
        args.cmdOrGrp.setEnabledIn(message.guild, true);
        return message.channel.send(embeds ? new MessageEmbed({
            color: "#0000FF",
            title: `${group ? "Command" : "Group"} enabled`,
            description
        }) : description);
    }
}