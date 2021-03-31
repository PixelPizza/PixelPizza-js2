import { DMChannel, MessageEmbed, Permissions } from "discord.js";
import {Command, CommandoClient, CommandoMessage} from "discord.js-commando";
// @ts-ignore
import {stripIndents} from "common-tags";

module.exports = class HelpCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "help",
            group: "util",
            memberName: "help",
            aliases: ["commands"],
            description: "Displays a list of available commands, or detailed information for a specified command.",
            details: "The command may be part of a command name or a whole command name. If it isn't specified, all available commands will be listed.",
            examples: ["help", "help order"],
            guarded: true,
            args: [
                {
                    key: "command",
                    prompt: "Which command would you like to view the help for?",
                    type: "string",
                    default: ""
                }
            ]
        });
    }

    async run(message: CommandoMessage, args: {command: string}) {
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        const groups = this.client.registry.groups;
        const commands = this.client.registry.findCommands(args.command, false, message);
        const showAll = args.command && args.command.toLowerCase() === "all";
        let reply: string | MessageEmbed = "";
        if(args.command && !showAll){
            if(commands.length === 1) {
                const command = commands[0];
                if(embeds){
                    reply = new MessageEmbed({
                        color: "#0000FF",
                        title: "Help",
                        description: `**${command.name}**: ${command.description}`,
                        fields: [
                            {
                                name: "Format",
                                value: message.anyUsage(`${command.name}${command.format ? ` ${command.format}` : ""}`)
                            }
                        ]
                    });
                    if(command.aliases.length) reply.addField("Aliases", command.aliases.join("\n"));
                    reply.addField("Group", `${command.group.name} (\`${command.groupID}:${command.memberName}\`)`);
                    if(command.details) reply.addField("Details", command.details);
                    if(command.examples) reply.addField("Examples", command.examples.join("\n"));
                } else {
                    reply = stripIndents`**Help**
                    **${command.name}**: ${command.description}
                    
                    **Format**
                    ${message.anyUsage(`${command.name}${command.format ? ` ${command.format}` : ""}`)}`;
                    if(command.aliases.length) {
                        reply += "\n";
                        reply += stripIndents`**Aliases**
                        ${command.aliases.join("\n")}`;
                    }
                    reply += "\n";
                    reply += stripIndents`**Group**
                    ${command.group.name} (\`${command.groupID}:${command.memberName}\`)`;
                    if(command.details) {
                        reply += "\n";
                        reply += stripIndents`**Details**
                        ${command.details}`;
                    }
                    if(command.examples) {
                        reply += "\n";
                        reply += stripIndents`**Examples**
                        ${command.examples.join("\n")}`;
                    }
                }
            } else {
                reply = commands.length > 1 ? `Multiple commands found. Please be more specific${commands.length > 15 ? "." : `: ${commands.map(command => command.name.replace(/ /g, "\xa0")).join("\n")}`}` : `Unable to identify command. Use ${message.usage()} to view the list of all commands.`;
                if(embeds){
                    reply = new MessageEmbed({
                        color: "#FF0000",
                        title: "Help",
                        description: reply
                    });
                }
            }
        } else {
            const title = showAll ? "All commands" : `Available commands in ${message.guild || "this DM"}`;
            const usableGroups = groups.filter(group => group.commands.some(command => !command.hidden && (showAll || command.isUsable(message))));
            if(embeds) {
                reply = new MessageEmbed({
                    color: "#0000FF",
                    title
                });
                for (let group of usableGroups.values()){
                    reply.addField(group.name, group.commands.filter(command => !command.hidden && (showAll || command.isUsable(message))).map(command => `**${command.name}:** ${command.description}${command.nsfw ? " (NSFW)" : ""}`).join("\n"));
                }
            } else {
                reply = stripIndents`**${title}**
                
                ${usableGroups.map(group => stripIndents`
                    **${group.name}**
                    ${group.commands.filter(command => !command.hidden && (showAll || command.isUsable(message))).map(command => `**${command.name}:** ${command.description}${command.nsfw ? " (NSFW)" : ""}`).join("\n")}
                `).join("\n\n")}`;
            }
        }
        return message.channel.send(reply);
    }
}