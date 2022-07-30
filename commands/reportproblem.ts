import { ChatInputCommandInteraction } from "discord.js"
import { Cmd } from "./command-exports"

const reportCommand: Cmd = {
    data: {
        name: 'report-problem',
        description: 'Report a problem with a bot'
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        return await interaction.reply({
            content: `**__Is there an issue with ZBot? Would you like to suggest something new?__**\n**Some of the links below may help:**\n• Join **our support server, [\`ZBot Server (En)\`](https://discord.gg/6tkn6m5g52)**\n• Report issues on **our [GitHub issues page](https://github.com/Zahid556/ZBot-En/issues)**, or suggest features either in our support server or on **our [GitHub Pull Requests page](https://github.com/Zahid556/ZBot-En/pulls)**.`,
            ephemeral: true
        })
    }
}

export {
    reportCommand
}
