import { DMChannel, MessageEmbed, Permissions } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Rule } from "../../api";

module.exports = class AddRuleCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "addrule",
            description: "Add a new rule for ordering",
            group: "rules",
            memberName: "addrules",
            details: "Only the bot owner(s) may use this command.",
            args: [
                {
                    key: "rule",
                    prompt: "What new rule do you want to add?",
                    type: "string"
                },
                {
                    key: "anarchy",
                    prompt: "Is this an anarchy rule?",
                    type: "boolean",
                    default: false
                }
            ],
            ownerOnly: true,
            guarded: true
        });
    }

    run(message: CommandoMessage, args: {rule: string, anarchy: boolean}) {
        let description = "Rule has been added";
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        if(this.client.provider.get(message.guild, "rules", []).map((rule: Rule) => rule.rule).includes(args.rule)){
            description = "Rule already exists";
            return message.channel.send(embeds ? new MessageEmbed({
                color: "#FF0000",
                title: "Rule exists",
                description
            }) : description);
        }
        for(let guild of this.client.guilds.cache.values()){
            const rules: Rule[] = this.client.provider.get(guild, "rules", []);
            rules.push({
                rule: args.rule,
                anarchy: args.anarchy
            });
            this.client.provider.set(guild, "rules", rules);
        }
        return message.channel.send(embeds ? new MessageEmbed({
            color: "#00FF00",
            title: "Rule added",
            description
        }) : description);
    }
}