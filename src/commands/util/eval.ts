import * as util from "util";
import {DMChannel, MessageEmbed, Permissions} from "discord.js";
import {CommandoClient, Command, CommandoMessage} from "discord.js-commando";
// @ts-ignore
import {stripIndents} from "common-tags";

const nl = '!!NL!!';
const nlPattern = new RegExp(nl, 'g');

module.exports = class EvalCommand extends Command {
    lastResult: any;
    hrStart!: [number, number];
    _sensitivePattern!: RegExp;

    constructor(client: CommandoClient) {
        super(client, {
            name: "eval",
            group: "util",
            memberName: "eval",
            description: "Executes JavaScript code.",
            details: "Only the bot owner(s) may use this command.",
            ownerOnly: true,
            args: [
                {
                    key: "script",
                    prompt: "What code would you like to evaluate?",
                    type: "string"
                }
            ]
        });

        this.lastResult = null;
        Object.defineProperty(this, "_sensitivePattern", { value: null, configurable: true });
    }

    // @ts-ignore
    run(message: CommandoMessage, args: {script: string}) {
        // helpers
        const client = message.client;
        const lastResult = this.lastResult;
        
        const embeds = message.channel instanceof DMChannel || !message.guild.me ? true : message.channel.permissionsFor(message.guild.me)?.has(Permissions.FLAGS.EMBED_LINKS) ?? false;
        if(args.script.startsWith("```") && args.script.endsWith("```")) {
            args.script = args.script.replace(/(^.*?\s)|(\n.*$)/g, "");
        }

        let hrDiff;
        try {
            const hrStart = process.hrtime();
            this.lastResult = eval(args.script);
            hrDiff = process.hrtime(hrStart);
        } catch (error) {
            const description = `Error while evaluating: \`${error}\``;
            return message.channel.send(embeds ? new MessageEmbed({
                color: "#FF0000",
                title: "Eval error",
                description
            }) : description);
        }

        this.hrStart = process.hrtime();
        const result = this.makeResultMessages(this.lastResult, hrDiff, args.script);
        if(Array.isArray(result)){
            return result.map(item => message.channel.send(embeds ? new MessageEmbed({
                color: "#0000FF",
                title: "Eval result",
                description: item
            }) : item));
        } else {
            return message.channel.send(embeds ? new MessageEmbed({
                color: "#0000FF",
                title: "Eval result",
                description: result
            }) : result);
        }
    }

    makeResultMessages(result: any, hrDiff: [number, number], input?: string) {
        const inspected = util.inspect(result, { depth: 0 })
            .replace(nlPattern, "\n")
            .replace(this.sensitivePattern, "--snip--");
        const split = inspected.split("\n");
        const last = inspected.length - 1;
        const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== "'" ? split[0] : inspected[0];
        const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== "'" ?
			split[split.length - 1] :
			inspected[last];
        const prepend = `\`\`\`javascript\n${prependPart}\n`;
        const append = `\n${appendPart}\n\`\`\``;
        if(input) {
            return this.splitMessage(stripIndents`
                *Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
                \`\`\`javascript
                ${inspected}
                \`\`\`
            `, {maxLength: 1900, prepend, append});
        } else {
			return this.splitMessage(stripIndents`
				*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append });
		}
    }

    escapeRegex(string: string) {
        return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    }

    splitMessage(text: string | string[], { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}): string | string[] {
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

    get sensitivePattern() {
        if(!this._sensitivePattern) {
            const client = this.client;
            let pattern = "";
            if(client.token) pattern += this.escapeRegex(client.token);
            Object.defineProperty(this, "_sensitivePattern", { value: new RegExp(pattern, "gi"), configurable: false });
        }
        return this._sensitivePattern;
    }
}