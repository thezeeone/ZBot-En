import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { Cmd } from "./command-exports";

const inviteCommand: Cmd = {
    data: {
        name: 'invite',
        description: 'Invite this bot to your server!',
        options: [
            {
                name: 'admin',
                description: 'Whether to use admin permissions. (default: false)',
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        return await interaction.reply(`[Click here](https://discord.com/oauth2/authorize?client_id=956596792542257192&permissions=${
            interaction.options.getBoolean('admin')
            ? '8'
            : '1644971949559'
        }&scope=bot%20applications.commands "Invite ZBot to your server! (${
            interaction.options.getBoolean('admin') 
            ? 'Administrator permissions' 
            : 'all permissions'
        })") to invite **ZBot** to your server. You can also join the support server [following this link](https://discord.gg/6tkn6m5g52) - the link is permanent. Thanks a lot!`)
    }
}

export {
    inviteCommand
}