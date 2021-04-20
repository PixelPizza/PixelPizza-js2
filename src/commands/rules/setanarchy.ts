import { DMChannel, MessageEmbed, Permissions } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
// @ts-ignore
import { stripIndents } from "common-tags";
import { Rule, BotSettings } from "../../api";
const {mainguild} = (require("../../../data/settings") as BotSettings);

module.exports = class SetAnarchyCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "setanarchy",
            description: "Set if a rule is an anarchy rule",
            group: "rules",
            memberName: "setanarchy",
            details: stripIndents`
                Only the bot owner(s) may use this command.
            `,
            args: [
                {
                    key: "ruleNumber",
                    prompt: "What rule do you want to edit?",
                    type: "integer"
                },
                {
                    key: "anarchy",
                    prompt: "Is this an anarchy rule?",
                    type: "boolean"
                }
            ],
            ownerOnly: true,
            guarded: true
        });
    }

    run(message: CommandoMessage, args: {ruleNumber: number, anarchy: boolean}) {
        let description = `Rule has been set to ${args.anarchy ? "anarchy" : "not anarchy"}`;
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        if(this.client.provider.get(mainguild, "rules", []).length < args.ruleNumber || args.ruleNumber < 1){
            description = "Rule not found";
            return message.channel.send(embeds ? new MessageEmbed({
                color: "#FF0000",
                title: "Rule doesn't exist",
                description
            }) : description);
        }
        const rules: Rule[] = this.client.provider.get(mainguild, "rules", []);
        const rule = rules[args.ruleNumber - 1];
        rules[args.ruleNumber - 1] = {
            rule: rule.rule,
            anarchy: args.anarchy
        };
        this.client.provider.set(mainguild, "rules", rules);
        return message.channel.send(embeds ? new MessageEmbed({
            color: "#00FF00",
            title: "Rule edited",
            description
        }) : description);
    }
}