import { DMChannel, MessageEmbed, Permissions } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
// @ts-ignore
import { stripIndents } from "common-tags";
import { Rule } from "../../api";

module.exports = class RulesCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "rules",
            description: "Show the rules",
            group: "rules",
            memberName: "rules",
            guarded: true
        });
    }

    // @ts-ignore
    run(message: CommandoMessage) {
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        const rules: Rule[] = this.client.provider.get(message.guild, "rules", []);
        if(!rules.length) {
            const description = "Could not find rules, please look at <#710433559042588733>";
            return message.channel.send(embeds ? new MessageEmbed({
                color: "#FF0000",
                title: "Rules not found",
                description
            }) : description);
        }
        const indexedRules = rules.map((rule, index) => {
            return {
                rule: `[${index+1}] ${rule.rule}`,
                anarchy: rule.anarchy
            };
        });
        return this.splitMessage(stripIndents`
            ${indexedRules.map(rule => rule.rule).join("\n")}

            **Anarchy rules**
            ${indexedRules.filter(rule => rule.anarchy).map(rule => rule.rule).join("\n")}
        `, {maxLength: embeds ? 2048 : 2000, char: "\n", prepend: "", append: ""})
            .map(ruleList => message.channel.send(embeds ? new MessageEmbed({
                color: "#0000FF",
                title: "Rules",
                description: ruleList
            }) : stripIndents`
                **Rules**
                ${ruleList}
            `)
        );
    }

    splitMessage(text: string | string[], { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}) {
        text = this.resolveString(text);
        if (text.length <= maxLength) return [text];
        const splitText = text.split(char);
        if (splitText.some(chunk => chunk.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');
        const messages = [];
        let msg = '';
        for (const chunk of splitText) {
          if (msg && (msg + char + chunk + append).length > maxLength) {
            messages.push(msg + append);
            msg = prepend;
          }
          msg += (msg && msg !== prepend ? char : '') + chunk;
        }
        return messages.concat(msg).filter(m => m);
    }

    resolveString(data: string | string[]) {
        if (typeof data === 'string') return data;
        if (Array.isArray(data)) return data.join('\n');
        return String(data);
    }
}