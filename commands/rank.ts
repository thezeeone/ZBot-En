import { ApplicationCommandOptionType, ChatInputCommandInteraction, Formatters } from "discord.js";
import { Cmd } from "./command-exports";
import { LevelModel } from "../database";

const rankCommand: Cmd = {
    data: {
        name: 'rank',
        description: 'Check yours or another user\'s rank',
        options: [
            {
                name: 'user',
                description: 'The user\'s rank to check',
                required: false,
                type: ApplicationCommandOptionType.User
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        const user = interaction?.options.getUser('user')

        if (user && user?.id !== interaction.user.id) {
            const userRank = await LevelModel.findOne({ where: { id: user.id } })
            if (!userRank) return await interaction.reply({ content: `${user.username} does not have a rank yet!`, ephemeral: true })
            await interaction.reply({
                ephemeral: true,
                content: `${Formatters.bold(Formatters.underscore(`Rank Card for ${Formatters.inlineCode(user.username)}`))}\n${Formatters.bold('Level')} ${userRank.lvl}\n${Formatters.bold('Experience Points')} ${userRank.xp}\n**Experience points required for ${user.username} to hit Level ${userRank.lvl + 1}** ${50 * (userRank.lvl + 1) - userRank.xp}`
            })
        } else {
            const userRank = await LevelModel.findOne({ where: { id: interaction.user.id } })
            if (!userRank) return await interaction.reply({ content: `You do not have a rank yet! Send a few messages first, and then try again.`, ephemeral: true })
            await interaction.reply({
                ephemeral: true,
                content: `${Formatters.bold(Formatters.underscore('Your Rank Card'))}\n${Formatters.bold('Level')} ${userRank.lvl}\n${Formatters.bold('Experience Points')} ${userRank.xp}\n**Experience points required for you to hit Level ${userRank.lvl + 1}** ${50 * (userRank.lvl + 1) - userRank.xp}`
            })
        }
    }
}

export { rankCommand }