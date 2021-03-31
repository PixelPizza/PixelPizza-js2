import { DMChannel, MessageEmbed, Permissions } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
// @ts-ignore
import { stripIndents } from "common-tags";
import { Rule } from "../../api";

module.exports = class RemoveRuleCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "removerule",
            description: "Remove a rule for ordering",
            group: "rules",
            memberName: "removerule",
            aliases: ["remrule", "deleterule", "delrule"],
            details: stripIndents`
                Only the bot owner(s) may use this command.
            `,
            args: [
                {
                    key: "ruleNumber",
                    prompt: "What rule do you want to remove?",
                    type: "integer"
                }
            ],
            ownerOnly: true,
            guarded: true
        });
    }

    run(message: CommandoMessage, args: {ruleNumber: number}) {
        let description = "Rule has been removed";
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        if(this.client.provider.get(message.guild, "rules", []).length < args.ruleNumber || args.ruleNumber == 0){
            description = "Rule not found";
            return message.channel.send(embeds ? new MessageEmbed({
                color: "#FF0000",
                title: "Rule doesn't exist",
                description
            }) : description);
        }
        for(let guild of this.client.guilds.cache.values()){
            const rules: Rule[] = this.client.provider.get(guild, "rules", []);
            rules.splice(args.ruleNumber - 1, 1);
            this.client.provider.set(guild, "rules", rules);
        }
        return message.channel.send(embeds ? new MessageEmbed({
            color: "#00FF00",
            title: "Rule removed",
            description
        }) : description);
    }
}