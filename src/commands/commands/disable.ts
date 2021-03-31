import { DMChannel, MessageEmbed, Permissions } from "discord.js";
import { CommandoClient, CommandoMessage, Command, CommandGroup } from "discord.js-commando";
// @ts-ignore
import { stripIndents } from "common-tags";

module.exports = class DisableCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "disable",
            aliases: ["disablecommand", "cmdoff", "commandoff"],
            group: "commands",
            memberName: "disable",
            description: "Disables a command or command group.",
            details: stripIndents`
                The argument must be the name/ID (partial or whole) of a command or command group.
                Only administrators may use this command.
            `,
            examples: ["disable util", "disable Utility", "disable help"],
            guarded: true,
            args: [
                {
                    key: "cmdOrGrp",
                    label: "command/group",
                    prompt: "Which command or group would you like to disable?",
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
        let description = `Disabled the \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'}.`;
        if(!args.cmdOrGrp.isEnabledIn(message.guild, true)) {
            description = `The \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'} is already disabled.`;
            return message.channel.send(embeds ? new MessageEmbed({
                color: "#FF0000",
                title: `Already disabled`,
                description
            }) : description);
        }
        if(args.cmdOrGrp.guarded) {
            description = `You cannot disable the \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'}.`;
            return message.channel.send(embeds ? new MessageEmbed({
                color: "#FF0000",
                title: `Cannot disable ${args.cmdOrGrp.group ? 'command' : 'group'}`,
                description
            }) : description);
        }
        args.cmdOrGrp.setEnabledIn(message.guild, false);
        return message.channel.send(embeds ? new MessageEmbed({
            color: "#00FF00",
            title: `${args.cmdOrGrp.group ? 'Command' : 'Group'} disabled`,
            description
        }) : description);
    }
}