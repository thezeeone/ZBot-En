import { ChatInputCommandInteraction } from "discord.js"
import { Cmd } from "./command-exports"

const voteCommand: Cmd = {
    data: {
        name: 'vote',
        description: 'Start a poll for other members! (coming soon!)'
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        // I don't know, something
        /*return await interaction.reply({
            content: 'Coming soon!\n\n⚠ **Note: this is an experimental feature and may break while in use.**',
            ephemeral: true
        })
        */
    }
}

export {
    voteCommand
}
