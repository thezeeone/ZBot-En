import { ChatInputCommandInteraction } from "discord.js"
import { Cmd } from "./command-exports"

const reportCommand: Cmd = {
    data: {
        name: 'report-problem',
        description: 'Report a problem with a bot'
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        return await interaction.reply({
            content: `**This command has been deprecated.**\nTo report a problem, please report it in the forum channels in [our support server](https://discord.gg/6tkn6m5g52 'ZBot Server (En)').`,
            ephemeral: true
        })
    }
}

export {
    reportCommand
}