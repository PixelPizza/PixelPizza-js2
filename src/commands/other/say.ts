import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

module.exports = class SayCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "say",
            description: "Let the bot say something",
            group: "other",
            memberName: "say",
            examples: ["say hi"],
            args: [
                {
                    key: "message",
                    prompt: "What do you want the bot to send?",
                    type: "string"
                }
            ],
            details: "Only the bot owner(s) may use this command.",
            guarded: true,
            guildOnly: true,
            hidden: true,
            ownerOnly: true
        });
    }

    run(message: CommandoMessage, args: {message: string}) {
        if(message.deletable) message.delete();
        return message.channel.send(args.message);
    }
}