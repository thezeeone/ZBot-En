import { ChatInputCommandInteraction } from "discord.js"
import { Cmd } from "./command-exports"

const reportCommand: Cmd = {
    data: {
        name: 'report-problem',
        description: 'Report a problem with a bot'
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        return await interaction.reply({
            content: `**This command has been deprecated.**`,
            ephemeral: true
        })
    }
}

export {
    reportCommand
}